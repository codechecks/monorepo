import * as requestPromise from "request-promise";
import { lstatSync, createWriteStream, createReadStream } from "graceful-fs"; // it handles max open files limits nicely
import { relative, join, dirname } from "path";
import glob = require("glob");
import mkdirp = require("mkdirp");
import { runOrCatchError, getRequiredEnv, ensureAbsolutePath } from "./utils";
import { StatusCodeError } from "request-promise/errors";
import { CodeChecksReport, CodeChecksReportStatus } from "./types";
import { Stream, Readable } from "stream";
import { Promise as Bluebird, delay } from "bluebird";
import { logger } from "./logger";

import request = require("request");
import { SharedExecutionContext } from "./getExecutionContext";

const DEFAULT_HOST = "https://api.codechecks.io/v1";
// we limit concurrent connections to avoid DOSing our own backend
// @note: since we use two different request objects total number of connections can reach 2x this value but this should not be a problem
const MAX_CONNECTIONS = 20;
// we automatically retry failed getFiles and saveFiles calls
const MAX_RETRY = 10;

export interface ApiOptions {
  token?: string;
  host?: string;
}

export class Api {
  private readonly requestPromise: typeof requestPromise;
  private readonly requestRaw: typeof request;
  private readonly sharedCtx!: SharedExecutionContext;

  constructor(options: ApiOptions) {
    this.requestPromise = requestPromise.defaults({
      headers: {
        Authorization: `Bearer ${options.token}`,
      },
      baseUrl: options.host || DEFAULT_HOST,
      pool: {
        maxSockets: MAX_CONNECTIONS,
      },
      timeout: 10000,
    });
    this.requestRaw = request.defaults({
      headers: {
        Authorization: `Bearer ${options.token}`,
      },
      baseUrl: options.host || DEFAULT_HOST,
      pool: {
        maxSockets: MAX_CONNECTIONS,
      },
      timeout: 10000,
    });
  }

  public async saveFileFromStream(
    fullKey: string,
    getContents: () => Stream,
    projectSlug?: string,
    contentType?: string,
  ): Promise<void> {
    return this.saveFileWithRetry(fullKey, getContents, MAX_RETRY, projectSlug, contentType);
  }

  public async getFileAsString(fullKey: string, projectSlug?: string): Promise<string | undefined> {
    return await this.getFileWithRetry(fullKey, MAX_RETRY, projectSlug);
  }

  public async makeCommitCheck(
    sha: string,
    baseSha: string | undefined,
    checks: CodeChecksReport[],
    projectSlug?: string,
  ): Promise<void> {
    return await this.requestPromise.post(projectSlug ? "/public/gh/commit-check" : "/gh/commit-check", {
      qs: {
        projectSlug,
      },
      body: {
        sha,
        baseSha,
        checks: checks.map(c => {
          let detailsUrl: ApiCheckDTO["detailsUrl"] = undefined;

          if (c.detailsUrl) {
            if (typeof c.detailsUrl === "string") {
              detailsUrl = {
                url: c.detailsUrl,
              };
            } else {
              detailsUrl = {
                url: c.detailsUrl.url,
                label: c.detailsUrl.label,
              };
            }
          }
          return {
            ...c,
            detailsUrl,
          };
        }) as ApiCheckDTO[],
      },
      json: true,
    });
  }

  public async prInfo(prId: number): Promise<PrInfo> {
    return await this.requestPromise.get("/gh/pr-info", {
      qs: {
        id: prId,
      },
      json: true,
    });
  }

  public async prInfoPublic(prId: number, projectSlug: string): Promise<PrInfo> {
    return await this.requestPromise.get("/public/gh/pr-info", {
      qs: {
        id: prId,
        projectSlug,
      },
      json: true,
    });
  }

  public async projectInfo(): Promise<ProjectInfo> {
    return await this.requestPromise.get("/projects/info", {
      json: true,
    });
  }

  public async projectInfoPublic(projectSlug: string): Promise<ProjectInfo> {
    return await this.requestPromise.get("/public/projects/info", {
      qs: {
        projectSlug,
      },
      json: true,
    });
  }

  /* #region  get/save JSON  values */
  public async getValue<T>(name: string, key: string, projectSlug?: string): Promise<T | undefined> {
    try {
      const res = await this.getFileAsString(`${key}/${name}.json`, projectSlug);
      if (!res) {
        return undefined;
      }

      return JSON.parse(res).value;
    } catch (e) {
      if (e instanceof StatusCodeError && e.statusCode === 404) {
        return undefined;
      }
      throw e;
    }
  }

  public async saveValue(name: string, value: any, key: string, projectSlug?: string): Promise<void> {
    await this.saveFileFromStream(
      `${key}/${name}.json`,
      () => {
        const stream = new Readable();
        stream.push(JSON.stringify({ value }));
        stream.push(null);

        return stream;
      },
      projectSlug,
      "application/json",
    );
  }
  /* #endregion */

  /* #region  get/save files */
  public async getFile(fullKey: string, destinationPath: string, projectSlug?: string): Promise<void> {
    ensureAbsolutePath(destinationPath);
    try {
      const fileString = await this.getFileAsString(fullKey, projectSlug);

      writeFile(destinationPath, fileString || "");
    } catch (e) {
      if (e.statusCode !== 404) {
        throw e;
      }
    }
  }

  public async saveFile(fullKey: string, sourcePath: string, projectSlug?: string): Promise<void> {
    ensureAbsolutePath(sourcePath);

    return await this.saveFileFromStream(fullKey, () => createReadStream(sourcePath), projectSlug);
  }
  /* #endregion */

  /* #region  get/save directories */
  public async getDirectory(name: string, destinationPath: string, key: string, projectSlug?: string): Promise<void> {
    const fullKeys = await this.getCollectionList(`${key}/${name}`, projectSlug);

    const promises = Bluebird.map<string, void>(
      fullKeys,
      async fullKey => {
        const file = await this.getFileAsString(fullKey, projectSlug);
        // fullKey looks like: SHA/name/x/y/z so we need to slice `SHA/name` path
        const finalPath = join(destinationPath, fullKey.substring(key.length + name.length + "/".length));

        writeFile(finalPath, file || "");
      },
      { concurrency: MAX_CONNECTIONS },
    );

    await Bluebird.all(promises);
  }

  private async getCollectionList(path: string, projectSlug?: string): Promise<string[]> {
    let continuationToken: string | undefined;
    let finalData: string[] = [];
    do {
      let response: { data: string[]; continuationToken?: string };
      if (projectSlug) {
        response = JSON.parse(
          await this.requestPromise.get(`public/directories/paged/${path}`, {
            qs: {
              projectSlug,
              continuationToken,
            },
          }),
        );
      } else {
        response = JSON.parse(
          await this.requestPromise.get(`directories/paged/${path}`, {
            qs: {
              continuationToken,
            },
          }),
        );
      }

      continuationToken = response.continuationToken;
      logger.debug("Continuation token for directory listing: ", continuationToken);
      finalData.push(...response.data);
    } while (continuationToken);

    return finalData;
  }

  public async saveDirectory(name: string, directoryPath: string, key: string, projectSlug?: string): Promise<void> {
    ensureAbsolutePath(directoryPath);

    const result = runOrCatchError(() => lstatSync(directoryPath));
    if (result && !result.isDirectory) {
      throw new Error(`${directoryPath} is not a directory!`);
    }

    const allFiles = glob.sync(`${directoryPath}/**/*`, {
      absolute: true,
      follow: false,
      nodir: true,
    });

    const promises = Bluebird.map<string, void>(
      allFiles,
      absPath => {
        const relPath = relative(directoryPath, absPath);

        return this.saveFileFromStream(`${key}/${name}/${relPath}`, () => createReadStream(absPath), projectSlug);
      },
      { concurrency: MAX_CONNECTIONS },
    );

    await Bluebird.all(promises);
  }
  /* #endregion */

  private async getFileWithRetry(_fullKey: string, retry: number, projectSlug?: string): Promise<string | undefined> {
    const fullKey = encodeURI(_fullKey);
    let file: string;
    try {
      logger.debug("Getting file: ", fullKey);
      if (this.sharedCtx.isLocalMode && this.sharedCtx.isLocalMode.isOffline) {
        logger.debug("Offline mode. Skipping...");

        return undefined;
      }

      if (projectSlug) {
        file = await this.requestPromise.get(`public/files/${fullKey}`, {
          qs: {
            projectSlug,
          },
          encoding: "binary",
        });
      } else {
        file = await this.requestPromise.get(`files/${fullKey}`, {
          encoding: "binary",
        });
      }
      logger.debug("Getting file: ", fullKey, "DONE");
      return file;
    } catch (e) {
      if (e.statusCode === 404 || retry === 0) {
        throw e;
      } else {
        await delay(1000);
        logger.debug("Getting file: ", fullKey, "RETRYING", retry);
        return this.getFileWithRetry(_fullKey, retry - 1);
      }
    }
  }

  private async saveFileWithRetry(
    _fullKey: string,
    getContents: () => Stream,
    retry: number,
    projectSlug?: string,
    contentType?: string,
  ): Promise<void> {
    const fullKey = encodeURI(_fullKey);
    try {
      await new Promise<void>((resolve, reject) => {
        logger.debug("Saving file: ", fullKey);
        if (this.sharedCtx.isLocalMode && this.sharedCtx.isLocalMode.isOffline) {
          logger.debug("Offline mode. Skipping...");

          return;
        }

        getContents()
          .pipe(
            projectSlug
              ? this.requestRaw.post(
                  `public/files/${fullKey}`,
                  contentType
                    ? { headers: { ["Content-Type"]: contentType }, qs: { projectSlug } }
                    : { qs: { projectSlug } },
                )
              : this.requestRaw.post(
                  `files/${fullKey}`,
                  contentType ? { headers: { ["Content-Type"]: contentType } } : undefined,
                ),
          )
          .on("response", resp => {
            if (resp.statusCode >= 200 && resp.statusCode < 300) {
              logger.debug("Saving file: ", fullKey, "DONE");
              resolve();
            } else {
              logger.debug("Invalid response", resp.statusCode, resp.body);
              reject(resp);
            }
          })
          .on("error", e => {
            reject(e);
          });
      });
    } catch (e) {
      if (retry === 0) {
        throw e;
      } else {
        await delay(1000);
        logger.debug("Saving file: ", fullKey, "RETRYING", retry);
        return this.saveFileWithRetry(_fullKey, getContents, retry - 1, projectSlug, contentType);
      }
    }
  }
}

export function getApiOptions(requiresSecret: boolean): ApiOptions {
  if (requiresSecret) {
    return {
      host: process.env["CC_HOST"],
    };
  } else {
    return {
      token: getRequiredEnv("CC_SECRET"),
      host: process.env["CC_HOST"],
    };
  }
}

export interface PrInfo {
  id: number;
  meta: {
    title: string;
    body: string;
  };
  head: {
    sha: string;
    branchName: string;
  };
  base: {
    sha: string;
    branchName: string;
  };
  files: FileStatuses;
}

export interface FileStatuses {
  changed: string[];
  added: string[];
  removed: string[];
}

export interface ProjectInfo {
  projectSlug: string;
  artifactsProxyUrl: string;
  artifactsProxySupportsPages: boolean;
  isPrivate: boolean;
}

interface ApiCheckDTO {
  name: string;
  shortDescription: string;
  longDescription?: string;
  detailsUrl?: {
    url: string;
    label?: string;
  };
  status: CodeChecksReportStatus;
}

function writeFile(path: string, fileAsString: string): void {
  mkdirp.sync(dirname(path));
  const writeStream = createWriteStream(path);
  writeStream.write(fileAsString, "binary");
  writeStream.end();
}

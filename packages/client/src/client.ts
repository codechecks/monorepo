import { Api } from "./api";
import { ExecutionContext } from "./getExecutionContext";
import { CodeChecksReport, CodeChecksReportBody } from "./types";
import { join } from "path";
import { processReport } from "./ci-providers/Local";
import { crash } from "./utils/errors";
const urlJoin = require("url-join") as (...args: string[]) => string;

export class NotPrError extends Error {
  constructor() {
    super("Not a PR!");
  }
}

export class CodechecksClient {
  constructor(private readonly api: Api, public readonly context: ExecutionContext) {}

  private getPublicProjectSlug(): string | undefined {
    if (this.context.isLocalMode) {
      return this.context.isLocalMode.projectSlug;
    }
    if (this.context.isFork) {
      return this.context.projectSlug;
    }
  }

  public async getValue<T>(name: string): Promise<T | undefined> {
    if (!this.context.pr) {
      throw crash("Not a PR!");
    }
    return this.api.getValue<T>(name, this.context.pr.base.sha, this.getPublicProjectSlug());
  }

  public async saveValue(name: string, value: any): Promise<void> {
    if (this.context.isLocalMode) {
      return;
    }
    return this.api.saveValue(name, value, this.context.currentSha, this.getPublicProjectSlug());
  }

  public async getFile(name: string, destinationPath: string): Promise<void> {
    if (!this.context.pr) {
      throw crash("Not a PR!");
    }

    return this.api.getFile(`${this.context.pr.base.sha}/${name}`, destinationPath, this.getPublicProjectSlug());
  }

  public async saveFile(name: string, filePath: string): Promise<void> {
    if (this.context.isLocalMode) {
      return;
    }
    return this.api.saveFile(`${this.context.currentSha}/${name}`, filePath, this.getPublicProjectSlug());
  }

  public async getDirectory(name: string, destinationPath: string): Promise<void> {
    if (!this.context.pr) {
      throw crash("Not a PR!");
    }
    return this.api.getDirectory(name, destinationPath, this.context.pr.base.sha, this.getPublicProjectSlug());
  }

  public async saveDirectory(name: string, directoryPath: string): Promise<void> {
    if (this.context.isLocalMode) {
      return;
    }
    return this.api.saveDirectory(name, directoryPath, this.context.currentSha, this.getPublicProjectSlug());
  }

  public async report(report: CodeChecksReport): Promise<void> {
    if (this.context.isLocalMode) {
      return processReport(report, this.context);
    } else {
      return this.api.makeCommitCheck(
        this.context.currentSha,
        this.context.pr && this.context.pr.base.sha,
        [report],
        this.getPublicProjectSlug(),
      );
    }
  }

  public async success(report: CodeChecksReportBody): Promise<void> {
    return this.report({ ...report, status: "success" });
  }

  public async failure(report: CodeChecksReportBody): Promise<void> {
    return this.report({ ...report, status: "failure" });
  }

  public isPr(): boolean {
    return this.context.isPr;
  }

  /**
   * Get browseable link to artifact without it's own domain ie. artifacts.codechecks.io/123/456/report/index.html
   */
  public getArtifactLink(path: string): string {
    if (this.context.isPrivate) {
      return urlJoin(this.context.artifactsProxy.url, this.context.currentSha, path);
    } else {
      // this could be simplified in future and projectSlug could become part of artifactsProxy.url returned from a backend so this wouldn't branch
      return urlJoin(this.context.artifactsProxy.url, this.context.projectSlug, this.context.currentSha, path);
    }
  }

  /**
   * Get browseable link to artifact with it's own domain ie. 123--456--report.artifacts.codechecks.io/index.html
   * Useful for SPAs that manipulate URLs. It will redirect '/' to index.html and you can't customize this behaviour.
   */
  public getPageLink(dirPath: string, filenamePath: string = ""): string {
    // in some environments this can be unavailable so just fallback to getArtifactLink
    // @todo remove prefixed dir path like /build => build
    if (!this.context.artifactsProxy.supportsPages) {
      return this.getArtifactLink(join(dirPath, filenamePath));
    }

    const [protocol, urlWithoutProtocol] = this.context.artifactsProxy.url.split("://");
    const subDomainsChain = [this.context.projectSlug, this.context.currentSha, ...dirPath.split("/")];
    return urlJoin(`${protocol}://${subDomainsChain.join("--")}.${urlWithoutProtocol}`, filenamePath);
  }
}

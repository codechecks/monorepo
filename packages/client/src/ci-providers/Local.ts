import { CiProvider, Env } from "./types";
import * as execa from "execa";
import { PrInfo } from "../api";
import { CodeChecksReport } from "../types";

const REMOTE_URL_REGEXP = /^git\@github\.com\:(.*)\.git$/;

/**
 * Run codechecks locally, not on CI. It requires running within git reposistory.
 */
export class LocalProvider implements CiProvider {
  constructor(private readonly env: Env, private readonly forcedLocalProjectSlug?: string) {}

  isCurrentlyRunning(): boolean {
    const isCI = this.env["CI"];

    return !isCI;
  }

  async getCurrentSha(): Promise<string> {
    return await this.getShaForRef("HEAD");
  }

  async getProjectSlug(): Promise<string> {
    // allow users to override local project slug
    if (this.forcedLocalProjectSlug) {
      return this.forcedLocalProjectSlug;
    }

    const rawRemoteUrl = (await execa.shell("git config --get remote.origin.url")).stdout.trim();

    const matches = REMOTE_URL_REGEXP.exec(rawRemoteUrl);
    if (!matches || !matches[1]) {
      throw new Error(`Can't get project slug from ${rawRemoteUrl}`);
    }
    const projectSlug = matches[1];

    return projectSlug;
  }

  getPullRequestID(): number {
    return 0;
  }

  async getPrInfo(): Promise<PrInfo> {
    return {
      id: 0,
      meta: {
        title: "Local run",
        body: "local run",
      },
      // @todo implement those. It's possible to get it from git
      files: {
        added: [],
        changed: [],
        removed: [],
      },
      head: {
        sha: await this.getCurrentSha(),
      },
      base: {
        // @todo we should have heuristics to detect "main" branch, sometimes it's dev
        sha: await this.getShaForRef("master"),
      },
    };
  }

  private async getShaForRef(ref: string): Promise<string> {
    return (await execa.shell(`git rev-parse ${ref}`)).stdout.trim();
  }

  public isFork(): boolean {
    return false;
  }
}

export function checkIfIsLocalMode(provider: CiProvider): boolean {
  return provider instanceof LocalProvider;
}

import * as marked from "marked";
import * as TerminalRenderer from "marked-terminal";

marked.setOptions({
  // Define custom renderer
  renderer: new TerminalRenderer(),
});

export function printCheck(checks: CodeChecksReport): void {
  console.log(
    marked(`
# ${checks.name} 
${checks.shortDescription}`),
  );

  if (checks.longDescription) {
    console.log(
      marked(`
## Long description: 
${checks.longDescription}
    `),
    );
  }

  console.log("----------------------");
}

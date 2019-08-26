import chalk from "chalk";
import * as execa from "execa";
import * as marked from "marked";
import * as TerminalRenderer from "marked-terminal";
import { PrInfo } from "../api";
import { ExecutionContext } from "../getExecutionContext";
import { logger } from "../logger";
import { CodeChecksReport } from "../types";
import { fullNameFromRemoteUrl } from "../utils/git";
import { CiProvider, Env } from "./types";

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

    return fullNameFromRemoteUrl(rawRemoteUrl);
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

  public supportsSpeculativeBranchSelection(): boolean {
    return true;
  }
}

export function checkIfIsLocalMode(provider: CiProvider): boolean {
  return provider instanceof LocalProvider;
}

marked.setOptions({
  // Define custom renderer
  renderer: new TerminalRenderer(),
});

function printCheck(report: CodeChecksReport): void {
  logger.log(
    marked(`
# ${report.status === "success" ? "✅" : "❌"} ${report.name}
${report.shortDescription}`),
  );

  if (report.longDescription) {
    logger.log(
      marked(`
## Long description:
${report.longDescription}`),
    );
  }

  logger.log(chalk.dim("---------------"));
  logger.log();
}

export function processReport(report: CodeChecksReport, context: ExecutionContext): void {
  printCheck(report);

  const isFailure = report.status === "failure";
  const { isLocalMode } = context;
  const shouldInterrupt = isFailure && isLocalMode && isLocalMode.isFailFast;
  if (shouldInterrupt) {
    logger.critical(`"${report.name}" check failed in fail fast mode`);
  }
}

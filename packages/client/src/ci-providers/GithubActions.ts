import { Env, CiProvider } from "./types";

export class GithubActions implements CiProvider {
  constructor(private readonly env: Env) {}

  isCurrentlyRunning(): boolean {
    return !!this.env["GITHUB_WORKFLOW"];
  }

  getPullRequestID(): number | undefined {
    if (this.env["GITHUB_EVENT_NAME"] !== "pull_request") {
      return undefined;
    }
    const eventPayload = this.getEventPayload();
    const prNumber = eventPayload.number;

    if (!prNumber || isNaN(prNumber)) {
      return undefined;
    }

    return prNumber;
  }

  private getEventPayload(): { number: number } {
    const eventPath = this.env["GITHUB_EVENT_PATH"] || "";

    try {
      return require(eventPath);
    } catch (error) {
      throw new Error(`Could not parse Github event JSON file: ${error}`);
    }
  }

  getCurrentSha(): string {
    const sha = this.env["GITHUB_SHA"];
    if (!sha) {
      throw new Error("Couldn't get target SHA");
    }

    return sha;
  }

  isFork(): boolean {
    // This is only set for forked repositories
    // @see https://help.github.com/en/articles/virtual-environments-for-github-actions#default-environment-variables
    return !!this.env["GITHUB_HEAD_REF"];
  }

  public getProjectSlug(): string {
    const projectSlug = this.env["GITHUB_REPOSITORY"];

    if (!projectSlug) {
      throw new Error("Missing GITHUB_REPOSITORY");
    }

    return projectSlug;
  }

  public supportsSpeculativeBranchSelection(): boolean {
    return true;
  }
}

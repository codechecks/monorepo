import { Env, CiProvider } from "./types";

export class Semaphore2 implements CiProvider {
  constructor(private readonly env: Env) {}

  isCurrentlyRunning(): boolean {
    return this.env["SEMAPHORE"] === "true";
  }

  getPullRequestID(): number | undefined {
    if (!this.env["SEMAPHORE_GIT_BRANCH"]) {
      return undefined;
    }

    return this.env.SEMAPHORE_GIT_BRANCH.substr(13);
  }

  getCurrentSha(): string {
    const sha = this.env["SEMAPHORE_GIT_SHA"];
    if (!sha) {
      throw new Error("Couldnt get target SHA");
    }

    return sha;
  }

  isFork(): boolean {
    if (!this.env["SEMAPHORE_GIT_BRANCH"]) {
      return false;
    }

    return this.env.SEMAPHORE_GIT_BRANCH.startsWith("pull-request-");
  }

  public getProjectSlug(): string {
    const slug = this.env["SEMAPHORE_GIT_REPO_SLUG"];
    if (!slug) {
      throw new Error("Couldnt get repo slug");
    }

    return slug;
  }

  public supportsSpeculativeBranchSelection(): boolean {
    return true;
  }
}

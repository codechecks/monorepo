import { Env, CiProvider } from "./types";
import { crash } from "../utils/errors";

export class Semaphore implements CiProvider {
  constructor(private readonly env: Env) {}

  isCurrentlyRunning(): boolean {
    return this.env["SEMAPHORE"] === "true";
  }

  getPullRequestID(): number | undefined {
    return undefined;
  }

  getCurrentSha(): string {
    const sha = this.env["SEMAPHORE_GIT_SHA"];
    if (!sha) {
      throw crash("Couldnt get target SHA");
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
    const slug = this.env["SEMAPHORE_PROJECT_NAME"];
    if (!slug) {
      throw crash("Couldnt get repo slug");
    }

    return `${this.env["SEMAPHORE_PROJECT_NAME"]}/${this.env["SEMAPHORE_GIT_DIR"]}`;
  }

  public supportsSpeculativeBranchSelection(): boolean {
    return true;
  }
}

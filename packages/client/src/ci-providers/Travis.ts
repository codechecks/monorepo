import { Env, CiProvider } from "./types";

export class Travis implements CiProvider {
  constructor(private readonly env: Env) {}

  public name = "Travis";

  isCurrentlyRunning(): boolean {
    return this.env["TRAVIS"] === "true";
  }

  getPullRequestID(): number | undefined {
    const prNumberRaw = this.env["TRAVIS_PULL_REQUEST"] || "false";

    if (prNumberRaw === "false") {
      return undefined;
    }

    return parseInt(prNumberRaw);
  }

  getCurrentSha(): string {
    let sha: string | undefined;

    if (this.env["TRAVIS_PULL_REQUEST_SHA"]) {
      sha = this.env["TRAVIS_PULL_REQUEST_SHA"];
    } else {
      sha = this.env["TRAVIS_COMMIT"];
    }

    if (!sha) {
      throw new Error("Couldnt get target SHA");
    }

    return sha;
  }

  isFork(): boolean {
    if (this.env["TRAVIS_PULL_REQUEST"] === "false") {
      return false;
    }

    return !(this.env["TRAVIS_REPO_SLUG"] === this.env["TRAVIS_PULL_REQUEST_SLUG"]);
  }

  public getProjectSlug(): string {
    const slug = this.env["TRAVIS_REPO_SLUG"];

    if (!slug) {
      throw new Error("Missing TRAVIS_REPO_SLUG");
    }

    return slug;
  }

  // we don't need to attempt to guess the PR base branch because travis always triggers /pr builds when PR (or fork) is created
  public supportsSpeculativeBranchSelection(): boolean {
    return false;
  }
}

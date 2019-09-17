import { Env, CiProvider } from "./types";
import { crash } from "../utils/errors";

// github actions have explicit event for PR creation but we cant use it since it fired only once
// in future we need to build a mechanism to get pull request information using API since it's impossible to get from the inside the PR

export class GithubActions implements CiProvider {
  constructor(private readonly env: Env) {}

  isCurrentlyRunning(): boolean {
    return !!this.env["GITHUB_WORKFLOW"];
  }

  getPullRequestID(): number | undefined {
    return undefined;
  }

  getCurrentSha(): string {
    const sha = this.env["GITHUB_SHA"];
    if (!sha) {
      throw crash("Couldn't get target SHA");
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
      throw crash("Missing GITHUB_REPOSITORY");
    }

    return projectSlug;
  }

  public supportsSpeculativeBranchSelection(): boolean {
    return true;
  }
}

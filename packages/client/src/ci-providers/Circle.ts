import { Env, CiProvider } from "./types";

export class Circle implements CiProvider {
  constructor(private readonly env: Env) {}

  isCurrentlyRunning(): boolean {
    return this.env["CIRCLECI"] === "true";
  }

  getPullRequestID(): number | undefined {
    const prLink = this.env["CIRCLE_PULL_REQUEST"] || "";

    // get everything before last slash
    const parts = prLink.split("/");
    const prNumberRaw = parts[parts.length - 1];
    const prNumber = parseInt(prNumberRaw);

    if (isNaN(prNumber)) {
      return undefined;
    }
    return prNumber;
  }

  getCurrentSha(): string {
    const sha = this.env["CIRCLE_SHA1"];
    if (!sha) {
      throw crash("Couldnt get target SHA");
    }

    return sha;
  }

  isFork(): boolean {
    if (!this.env["CIRCLE_PULL_REQUEST"]) {
      return false;
    }

    return !!this.env.CIRCLE_PR_USERNAME && !!this.env.CIRCLE_PR_REPONAME;
  }

  public getProjectSlug(): string {
    const user = this.env["CIRCLE_PROJECT_USERNAME"];
    const projectName = this.env["CIRCLE_PROJECT_REPONAME"];

    if (!user || !projectName) {
      throw crash("Missing CIRCLE_PROJECT_USERNAME or CIRCLE_PROJECT_REPONAME");
    }

    return `${user}/${projectName}`;
  }

  public supportsSpeculativeBranchSelection(): boolean {
    return true;
  }
}

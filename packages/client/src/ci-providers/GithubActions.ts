import { Env, CiProvider } from "./types";
import { crash } from "../utils/errors";
import { readFileSync } from "fs";
import { get } from "lodash";
import { join } from "path";

// github actions have explicit event for PR creation but we cant use it since it fired only once
// in future we need to build a mechanism to get pull request information using API since it's impossible to get from the inside the PR

export class GithubActions implements CiProvider {
  constructor(private readonly env: Env) {}

  isCurrentlyRunning(): boolean {
    return !!this.env["GITHUB_WORKFLOW"];
  }

  getPullRequestID(): number | undefined {
    const event = this.getEvent();

    return event.number;
  }

  getCurrentSha(): string {
    const event = this.getEvent();
    const sha = get(event, "pull_request.head.sha") || this.env["GITHUB_SHA"];
    if (!sha) {
      throw crash("Couldn't get target SHA");
    }

    return sha;
  }

  isFork(): boolean {
    const event = this.getEvent();

    return get(event, "pull_request.head.repo.fork") || false;
  }

  public getProjectSlug(): string {
    const event = this.getEvent();

    if (this.isFork()) {
      return get(event, "pull_request.base.repo.full_name");
    }

    return get(event, "pull_request.head.repo.full_name") || get(event, "repository.full_name");
  }

  public supportsSpeculativeBranchSelection(): boolean {
    return true;
  }

  private getEvent(): any {
    // tslint:disable-next-line
    let eventPath = this.env["GITHUB_EVENT_PATH"]!;
    // workaround for tests
    if (eventPath.startsWith(".")) {
      eventPath = join(__dirname, eventPath);
    }

    const eventFile = readFileSync(eventPath, "utf-8");
    const event = JSON.parse(eventFile);

    return event;
  }
}

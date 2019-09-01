import { Env, CiProvider } from "./types";
import { crash } from "../utils/errors";

export function parseRepositorySlug(repoUrl: string): string {
  const GIT_URL_REGEX = /^(https|git)(:\/\/|@)([^\/:]+)[\/:]([^\/:]+)\/(.+).git$/;
  const repoMatch = repoUrl.match(GIT_URL_REGEX);

  if (!repoMatch) {
    throw crash(`Couldnt parse repository slug from ${repoUrl}`);
  }
  return `${repoMatch[4]}/${repoMatch[5]}`;
}

export class BuildKite implements CiProvider {
  constructor(private readonly env: Env) {}

  isCurrentlyRunning(): boolean {
    return this.env["BUILDKITE"] === "true";
  }

  getPullRequestID(): number | undefined {
    const prNumberRaw = this.env["BUILDKITE_PULL_REQUEST"] || "false";

    if (prNumberRaw === "false") {
      return undefined;
    }

    return parseInt(prNumberRaw);
  }

  getCurrentSha(): string {
    const sha = this.env["BUILDKITE_COMMIT"];
    if (!sha) {
      throw crash("Couldnt get target SHA");
    }

    return sha;
  }

  isFork(): boolean {
    if (this.env["BUILDKITE_PULL_REQUEST"] === "false") {
      return false;
    }
    const buildKitePullRequestRepo = this.env["BUILDKITE_PULL_REQUEST_REPO"] || "";
    const buildKiteRepo = this.env["BUILDKITE_REPO"] || "";
    try {
      const prSlug = parseRepositorySlug(buildKitePullRequestRepo);
      const repoSlug = parseRepositorySlug(buildKiteRepo);

      return prSlug !== repoSlug;
    } catch {
      return false;
    }
  }

  public getProjectSlug(): string {
    const buildKiteRepo = this.env["BUILDKITE_REPO"] || "";

    return parseRepositorySlug(buildKiteRepo);
  }

  public supportsSpeculativeBranchSelection(): boolean {
    return true;
  }
}

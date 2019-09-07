import { Env, CiProvider } from "./types";
import { crash } from "../utils/errors";

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
    if (!this.env["CIRCLE_PULL_REQUESTS"]) {
      return false;
    }

    // i think these exist only when fork is executed on original owners CI
    if (!!this.env.CIRCLE_PR_USERNAME && !!this.env.CIRCLE_PR_REPONAME) {
      return true;
    }

    const projectSlugFromPrList = this.getPrInfoFromPrList();
    const projectSlugFromBuildURL = this.getPrInfoFromBuildURL();

    return projectSlugFromPrList.user !== projectSlugFromBuildURL.user;
  }

  public getProjectSlug(): string {
    const prInfo = this.isFork() ? this.getPrInfoFromPrList() : this.getPrInfoFromBuildURL();

    return `${prInfo.user}/${prInfo.projectName}`;
  }

  private getPrInfoFromPrList(): PrInfo {
    const prs = this.getPullRequests();
    const pr = prs[0]; // always just take first valid PR... at least for now @todo

    const prInfo = parsePrUrl(pr);

    if (!prInfo) {
      throw crash(`Couldnt parse PR url: ${pr}`);
    }

    return prInfo;
  }

  private getPrInfoFromBuildURL(): PrInfo {
    const buildUrl = this.env["CIRCLE_BUILD_URL"];
    if (!buildUrl) {
      throw crash("CIRCLE_BUILD_URL is missing!");
    }
    const prInfo = parseBuildURL(buildUrl);

    if (!prInfo) {
      throw crash(`Couldnt parse CIRCLE_BUILD_URL: ${buildUrl}`);
    }

    return prInfo;
  }

  private getPullRequests(): string[] {
    const prs = this.env["CIRCLE_PULL_REQUESTS"];
    if (!prs) {
      throw crash("Missing CIRCLE_PULL_REQUESTS");
    }

    return prs.split(",");
  }

  public supportsSpeculativeBranchSelection(): boolean {
    return true;
  }
}

function parseBuildURL(buildUrl: string | undefined): PrInfo | undefined {
  if (!buildUrl) {
    return;
  }
  //parse for example: https://circleci.com/gh/BrunnerLivio/nest/58
  const regex = /https:\/\/circleci\.com\/gh\/(.*?)\/(.*?)\/([0-9]*)/;
  const match = buildUrl.match(regex);
  if (!match) {
    return;
  }
  const [, user, projectName, buildId] = match;

  return {
    user,
    projectName,
    id: parseInt(buildId),
  };
}

function parsePrUrl(prUrl: string | undefined): PrInfo | undefined {
  if (!prUrl) {
    return;
  }
  // parse for example: https://github.com/nestjs/nest/pull/2888
  const PROJECT_SLUG_REGEX = /https:\/\/github\.com\/(.*?)\/(.*?)\/([0-9]*)/;
  const match = prUrl.match(PROJECT_SLUG_REGEX);
  if (!match) {
    return;
  }
  const [, user, projectName, buildId] = match;

  return { user, projectName, id: parseInt(buildId) };
}

interface PrInfo {
  user: string;
  projectName: string;
  id: number;
}

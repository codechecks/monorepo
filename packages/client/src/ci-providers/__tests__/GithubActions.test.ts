import { join } from "path";

import { readEnvFile } from "./utils";
import { GithubActions } from "../GithubActions";

describe("Github Actions", () => {
  const env = readEnvFile(join(__dirname, "__fixtures__", "github/pr.env"));
  const envFork = readEnvFile(join(__dirname, "__fixtures__", "github/fork.env"));
  const envNoPR = readEnvFile(join(__dirname, "__fixtures__", "github/nopr.env"));

  // We have to stub the path here because we cannot do this in the .env fixture. Github
  // will give us an absolute path.
  // @see https://help.github.com/en/articles/virtual-environments-for-github-actions#default-environment-variables
  env.GITHUB_EVENT_PATH = join(__dirname, env.GITHUB_EVENT_PATH || "");
  envFork.GITHUB_EVENT_PATH = join(__dirname, envFork.GITHUB_EVENT_PATH || "");
  envNoPR.GITHUB_EVENT_PATH = join(__dirname, envNoPR.GITHUB_EVENT_PATH || "");

  it("should detect github", () => {
    const provider = new GithubActions(env);

    expect(provider.isCurrentlyRunning()).toBe(true);
  });

  it("should not detect github when not running inside github", () => {
    const provider = new GithubActions({});

    expect(provider.isCurrentlyRunning()).toBe(false);
  });

  it("should get pull request id", () => {
    const provider = new GithubActions(env);

    expect(provider.getPullRequestID()).toBe(2);
  });

  it("should not get pull request id if not running in PR context", () => {
    const provider = new GithubActions(envNoPR);

    expect(provider.getPullRequestID()).toBeUndefined();
  });

  it("should get target SHA", () => {
    const provider = new GithubActions(env);

    expect(provider.getCurrentSha()).toBe("ffac537e6cbbf934b08745a378932722df287a53");
  });

  it("should not detect fork mode", () => {
    const provider = new GithubActions(env);

    expect(provider.isFork()).toBe(false);
  });

  it("should detect fork mode", () => {
    const provider = new GithubActions(envFork);

    expect(provider.isFork()).toBe(true);
  });
});

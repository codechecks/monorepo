import { join } from "path";

import { readEnvFile } from "./utils";
import { GithubActions } from "../GithubActions";

describe("Github Actions", () => {
  const env = readEnvFile(join(__dirname, "__fixtures__", "github/pr.env"));
  const envFork = readEnvFile(join(__dirname, "__fixtures__", "github/fork.env"));

  it("should detect github", () => {
    const provider = new GithubActions(env);

    expect(provider.isCurrentlyRunning()).toBe(true);
  });

  it("should not detect github when not running inside github", () => {
    const provider = new GithubActions({});

    expect(provider.isCurrentlyRunning()).toBe(false);
  });

  it("should not get pull request id", () => {
    const provider = new GithubActions(env);

    expect(provider.getPullRequestID()).toBe(undefined);
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

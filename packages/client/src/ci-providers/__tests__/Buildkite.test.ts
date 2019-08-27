import { join } from "path";

import { readEnvFile } from "./utils";
import { BuildKite, parseRepositorySlug } from "../BuildKite";

describe("Buildkite", () => {
  const env = readEnvFile(join(__dirname, "__fixtures__", "build-kite/pr.env"));
  const envFork = readEnvFile(join(__dirname, "__fixtures__", "build-kite/fork.env"));
  const envNoPR = readEnvFile(join(__dirname, "__fixtures__", "build-kite/nopr.env"));

  it("should detect buildkiteci", () => {
    const provider = new BuildKite(env);

    expect(provider.isCurrentlyRunning()).toBe(true);
  });

  it("should not detect buildkiteci when not running inside buildkiteci", () => {
    const provider = new BuildKite({});

    expect(provider.isCurrentlyRunning()).toBe(false);
  });

  it("should get pull request id", () => {
    const provider = new BuildKite(env);

    expect(provider.getPullRequestID()).toBe(111);
  });

  it("should not get pull request id if not running in PR context", () => {
    const provider = new BuildKite(envNoPR);

    expect(provider.getPullRequestID()).toBe(undefined);
  });

  it("should get target SHA", () => {
    const provider = new BuildKite(env);

    expect(provider.getCurrentSha()).toBe("a673a30d0c992fae2f8495dbf6ed3c37455aa402");
  });

  it("should not detect fork mode", () => {
    const provider = new BuildKite(env);

    expect(provider.isFork()).toBe(false);
  });

  it("should detect fork mode", () => {
    const provider = new BuildKite(envFork);

    expect(provider.isFork()).toBe(true);
  });
});

describe("parseRepositorySlug", () => {
  it("should parse basic slug from git repository url", () => {
    expect(parseRepositorySlug("git@github.com:user/repo.git")).toEqual("user/repo");
    expect(parseRepositorySlug("https://github.com/user/repo.git")).toEqual("user/repo");
  });

  it("should parse basic slug from repository that is not a GitHub URL", () => {
    expect(parseRepositorySlug("https://gitlab.com/user/repo.git")).toEqual("user/repo");
  });
});

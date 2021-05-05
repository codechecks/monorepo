import { join } from "path";

import { readEnvFile } from "./utils";
import { GithubActions } from "../GithubActions";

describe("Github Actions", () => {
  describe("PR", () => {
    const env = readEnvFile(join(__dirname, "__fixtures__", "githubActions/pr.env"));

    it("works", () => {
      const provider = new GithubActions(env);

      expect(provider.isCurrentlyRunning()).toBe(true);
      expect(provider.isFork()).toBe(false);
      expect(provider.getPullRequestID()).toBe(4);
      expect(provider.getProjectSlug()).toBe("test12345678t/actions-tests");
      expect(provider.getCurrentSha()).toBe("e4ff1a0b045b110a613ae7dfcd324546645c8571");
    });
  });

  describe("Not PR", () => {
    const env = readEnvFile(join(__dirname, "__fixtures__", "githubActions/nopr.env"));

    it("works", () => {
      const provider = new GithubActions(env);

      expect(provider.isCurrentlyRunning()).toBe(true);
      expect(provider.isFork()).toBe(false);
      expect(provider.getPullRequestID()).toBe(undefined);
      expect(provider.getProjectSlug()).toBe("test12345678t/actions-tests");
      expect(provider.getCurrentSha()).toBe("3941c1db650b68763a4a3b66c049bddc2ae9aad3");
    });
  });

  describe("fork", () => {
    const env = readEnvFile(join(__dirname, "__fixtures__", "githubActions/fork.env"));

    it("works", () => {
      const provider = new GithubActions(env);

      expect(provider.isCurrentlyRunning()).toBe(true);
      expect(provider.isFork()).toBe(true);
      expect(provider.getProjectSlug()).toBe("krzkaczor/actions-tests");
      expect(provider.getPullRequestID()).toBe(3);
      expect(provider.getCurrentSha()).toBe("6a0c7cd10b59d2520ea8a5f4860aa98f167cb27a");
    });
  });

  it("should not detect github when not running inside github", () => {
    const provider = new GithubActions({});

    expect(provider.isCurrentlyRunning()).toBe(false);
  });
});

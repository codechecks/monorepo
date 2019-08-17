import * as mockFS from "mock-fs";
import { join } from "path";
import { findRootGitRepository, fullNameFromRemoteUrl } from "../git";

const rootVirtualPath = "/app";

describe("utils > git", () => {
  describe("findRootGitRepository", () => {
    it("should find root project directory", () => {
      mockFS({
        [join(rootVirtualPath)]: {
          ".git": {
            "internal-git-files": "",
          },
        },
      });

      const actualRootGitRepo = findRootGitRepository(rootVirtualPath);

      mockFS.restore();
      expect(actualRootGitRepo).toBe(rootVirtualPath);
    });

    it("should find root project directory from subdirectory", () => {
      mockFS({
        [rootVirtualPath]: {
          ".git": {
            "internal-git-files": "",
          },
          src: {
            "index.js": "",
          },
        },
      });

      const path = join(rootVirtualPath, "src");
      const actualRootGitRepo = findRootGitRepository(path);

      mockFS.restore();
      expect(actualRootGitRepo).toBe(rootVirtualPath);
    });
  });

  describe("fullNameFromRemoteUrl", () => {
    it("should return repository full name from ssh url", () => {
      expect(fullNameFromRemoteUrl("git@github.com:codechecks/monorepo.git")).toEqual("codechecks/monorepo");
      expect(fullNameFromRemoteUrl("git@github.com:codechecks/awesome-codechecks.git")).toEqual("codechecks/awesome-codechecks");
      expect(fullNameFromRemoteUrl("git@github.com:MikeMcl/bignumber.js.git")).toEqual("MikeMcl/bignumber.js");
    });

    it("should return repository full name from clone url", () => {
      expect(fullNameFromRemoteUrl("https://github.com/codechecks/monorepo.git")).toEqual("codechecks/monorepo");
      expect(fullNameFromRemoteUrl("http://github.com/codechecks/monorepo.git")).toEqual("codechecks/monorepo");
    });

    it("should return repository full name from svn url", () => {
      expect(fullNameFromRemoteUrl("https://github.com/codechecks/monorepo")).toEqual("codechecks/monorepo");
      expect(fullNameFromRemoteUrl("http://github.com/codechecks/monorepo")).toEqual("codechecks/monorepo");
    });

    it("should throw on unmatched url", () => {
      expect(() => fullNameFromRemoteUrl("github.com/codechecks/monorepo")).toThrowError("Can't get project slug from github.com/codechecks/monorepo")
    });
  });
});

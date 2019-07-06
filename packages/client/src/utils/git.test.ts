import * as mockFS from "mock-fs";
import { join } from "path";
import { findRootGitRepository } from "./git";

const rootVirtualPath = "/app";

describe("utils > git", () => {
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

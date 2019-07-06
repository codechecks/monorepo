import { existsSync } from "fs";
import { join } from "path";

export function findRootGitRepository(path: string): string | undefined {
  const gitDirPath = join(path, ".git");
  const parentDir = join(path, "..");

  if (path === "/" || !path) {
    return undefined;
  }

  if (existsSync(gitDirPath)) {
    return path;
  } else {
    return findRootGitRepository(parentDir);
  }
}

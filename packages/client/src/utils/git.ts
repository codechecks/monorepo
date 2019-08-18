import { existsSync } from "fs";
import { join } from "path";

const REMOTE_URL_REGEXP = /^(?:(?:git\@)|(?:https?:\/\/))github\.com(?::|\/)(.+)$/;

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

export function fullNameFromRemoteUrl(remoteUrl: string): string {
  const matches = remoteUrl.match(REMOTE_URL_REGEXP);
  if (!matches || !matches[1]) {
    throw new Error(`Can't get project slug from ${remoteUrl}`);
  }
  return matches[1].replace(/(.git)$/, "");
}

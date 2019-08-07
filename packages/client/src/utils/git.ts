import { existsSync } from "fs";
import { join } from "path";
import { logger } from "../logger";

import execa = require("execa");

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

export async function getHeadCommit(repoPath: string): Promise<string> {
  return await run(repoPath, "git rev-parse HEAD");
}

export async function getBranchName(repoPath: string): Promise<string | undefined> {
  try {
    return await run(repoPath, "git rev-parse --abbrev-ref HEAD");
  } catch (e) {
    logger.debug("Error in getBranchName ", e);
    return undefined;
  }
}

export async function run(cwd: string, cmd: string): Promise<string> {
  const { stdout } = await execa(cmd, { shell: true, cwd });

  return stdout;
}

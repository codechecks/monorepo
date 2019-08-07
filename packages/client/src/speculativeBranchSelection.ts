import { PrInfo, FileStatuses } from "./api";
import { CodeChecksSettings } from "./types";
import { logger } from "./logger";
import execa = require("execa");

const diffParser = require("./js/diff-parser/diff-parser.js").DiffParser;

export async function getPrInfoForSpeculativeBranch(
  settings: CodeChecksSettings,
  gitRepoRootPath: string,
): Promise<PrInfo | undefined> {
  logger.debug("Trying speculative branch execution");
  const headCommit = await getHeadCommit(gitRepoRootPath);
  const baseCommit = await getBaseCommit(gitRepoRootPath, settings.branches);
  if (!baseCommit) {
    return;
  }
  if (baseCommit === headCommit) {
    throw new Error(
      `Speculative branch selection failed. baseCommit can't be equal to headCommit (${baseCommit}). Please create Pull Request to skip this problem.`,
    );
  }

  const fileStatuses = await getFileStatuses(gitRepoRootPath, baseCommit, headCommit);

  return {
    id: 0,
    meta: {
      title: "",
      body: "",
    },
    head: {
      sha: headCommit,
    },
    base: {
      sha: baseCommit,
    },
    files: fileStatuses,
  } as any;
  // @todo implement
}

async function getHeadCommit(repoPath: string): Promise<string> {
  return await run(repoPath, "git rev-parse HEAD");
}

async function getBaseCommit(repoPath: string, speculativeBranchesInOrder: string[]): Promise<string | undefined> {
  const headBranch = await run(repoPath, `git rev-parse --abbrev-ref HEAD`);
  const baseBranchName = findSpeculativeBaseBranch(headBranch, speculativeBranchesInOrder);

  logger.debug({ baseBranchName });

  if (baseBranchName) {
    // @NOTE: this might be CircleCI specific thing but for some reason we NEED to take remote branch origin/* because local one is somehow already updated but this might now work on some environments...
    try {
      await run(repoPath, `git fetch origin ${baseBranchName}`);
      const sha = await run(repoPath, `git rev-parse FETCH_HEAD`);
      return sha;
    } catch (e) {
      logger.debug(e);
      logger.debug(`Failed to access origin/${baseBranchName}. Trying with: ${baseBranchName}`);
      const { stdout: sha } = await execa(`git rev-parse ${baseBranchName}`, { shell: true, cwd: repoPath });
      return sha;
    }
  }
}

/**
 * Finds speculative branch based on the current branch name. If current branch is not on the list at all, select first. If it is, take the next one. If it's the last one just return undefined.
 */
function findSpeculativeBaseBranch(
  currentBranchName: string,
  speculativeBranchesInOrder: string[],
): string | undefined {
  const currentBranchInOrder = speculativeBranchesInOrder.indexOf(currentBranchName);

  return speculativeBranchesInOrder[currentBranchInOrder + 1];
}

async function getFileStatuses(repo: string, baseCommit: string, headCommit: string): Promise<FileStatuses> {
  const diffRaw = await run(repo, `git diff ${baseCommit}..${headCommit}`);
  const diffs = diffParser.generateDiffJson(diffRaw);

  const added: string[] = [];
  const changed: string[] = [];
  const removed: string[] = [];

  // todo fix paths
  for (const diff of diffs) {
    if (diff.isNew) {
      added.push(diff.newName);
    } else if (diff.isDeleted) {
      removed.push(diff.oldName);
    } else if (diff.isRename) {
      removed.push(diff.oldName);
      added.push(diff.newName);
    } else {
      changed.push(diff.newName);
    }
  }

  return {
    changed,
    added,
    removed,
  };
}

export async function run(cwd: string, cmd: string): Promise<string> {
  const { stdout } = await execa(cmd, { shell: true, cwd });

  return stdout;
}

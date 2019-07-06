import * as Git from "nodegit";

import { PrInfo, FileStatuses } from "./api";
import { CodeChecksSettings } from "./types";
import { logger } from "./logger";
import execa = require("execa");

export async function getPrInfoForSpeculativeBranch(
  settings: CodeChecksSettings,
  gitRepoRootPath: string,
): Promise<PrInfo | undefined> {
  logger.debug("Trying speculative branch execution");
  const repo = await Git.Repository.open(gitRepoRootPath);
  const headCommit = await repo.getHeadCommit();
  const baseCommit = await getBaseCommit(repo, settings.branches);
  if (!baseCommit) {
    return;
  }
  if (baseCommit.sha() === headCommit.sha()) {
    throw new Error(
      "Speculative branch selection failed. baseCommit can't be equal to headCommit. Please create Pull Request to skip this problem.",
    );
  }

  const fileStatuses = await getFileStatuses(repo, baseCommit, headCommit);

  return {
    id: 0,
    meta: {
      title: "",
      body: "",
    },
    head: {
      sha: headCommit.sha(),
    },
    base: {
      sha: baseCommit.sha(),
    },
    files: fileStatuses,
  };
}

async function getBaseCommit(
  repo: Git.Repository,
  speculativeBranchesInOrder: string[],
): Promise<Git.Commit | undefined> {
  const headBranch = await repo.getCurrentBranch();
  const baseBranchName = findSpeculativeBaseBranch(headBranch.shorthand(), speculativeBranchesInOrder);

  logger.debug({ baseBranchName });

  if (baseBranchName) {
    // @NOTE: this might be CircleCI specific thing but for some reason we NEED to take remote branch origin/* because local one is somehow already updated but this might now work on some environments...
    try {
      const { stdout, stderr } = await execa("git fetch --all", { shell: true });
      logger.debug({ stdout, stderr });
      return await repo.getBranchCommit(`origin/${baseBranchName}`);
    } catch (e) {
      logger.debug(e);
      logger.debug(`Failed to access origin/${baseBranchName}. Trying with: ${baseBranchName}`);
      return await repo.getBranchCommit(baseBranchName);
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

async function getFileStatuses(
  repo: Git.Repository,
  baseCommit: Git.Commit,
  headCommit: Git.Commit,
): Promise<FileStatuses> {
  const diff = await Git.Diff.treeToTree(repo, await baseCommit.getTree(), await headCommit.getTree());
  const patches = await diff.patches();

  const added: string[] = [];
  const changed: string[] = [];
  const removed: string[] = [];

  // todo fix paths
  for (const patch of patches) {
    if (patch.isAdded()) {
      added.push(patch.newFile().path());
    } else if (patch.isModified()) {
      changed.push(patch.newFile().path());
    } else if (patch.isDeleted()) {
      removed.push(patch.oldFile().path());
    } else {
      throw new Error(`Unrecognized changed status. ${patch}`);
    }
  }

  return {
    changed,
    added,
    removed,
  };
}

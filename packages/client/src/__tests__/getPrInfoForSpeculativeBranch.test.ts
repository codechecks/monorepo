import { getPrInfoForSpeculativeBranch } from "../speculativeBranchSelection";
import { CodeChecksSettings } from "../types";
import { join } from "path";
import * as fse from "fs-extra";
import execa = require("execa");

const repoPath = join(__dirname, "./dummy-repo");
const indexPath = "index.js";
const indexPathAbs = join(repoPath, indexPath);
const index2Path = "index2.js";
const index2PathAbs = join(repoPath, index2Path);

describe("getPrInfoForSpeculativeBranch", () => {
  it("should work when no changes were made", async () => {
    const settings: CodeChecksSettings = {
      speculativeBranchSelection: true,
      speculativeBranches: ["master"],
    };

    await prepareRepo(repoPath);

    const prInfo = await getPrInfoForSpeculativeBranch(settings, repoPath);

    expect(prInfo).toMatchInlineSnapshot(`undefined`);
  });

  it("should work when with various changes", async () => {
    const settings: CodeChecksSettings = {
      speculativeBranchSelection: true,
      speculativeBranches: ["master"],
    };

    await prepareRepo(repoPath);

    await fse.appendFile(indexPathAbs, `console.log("123!");`);
    await fse.writeFile(index2PathAbs, `console.log("456!");`);

    await makeBranchAndCheckout(repoPath, "feature1");
    await makeCommit(repoPath, "second commit");

    const prInfo = await getPrInfoForSpeculativeBranch(settings, repoPath);

    const deterministicPrInfo = { ...prInfo, base: {}, head: {} };

    expect(deterministicPrInfo).toMatchInlineSnapshot(`
Object {
  "base": Object {},
  "files": Object {
    "added": Array [
      "index2.js",
    ],
    "changed": Array [
      "index.js",
    ],
    "removed": Array [],
  },
  "head": Object {},
  "id": 0,
  "meta": Object {
    "body": "",
    "title": "",
  },
}
`);
  });

  it("should work when with deleted files", async () => {
    const settings: CodeChecksSettings = {
      speculativeBranchSelection: true,
      speculativeBranches: ["master"],
    };

    await prepareRepo(repoPath);

    await fse.remove(indexPathAbs);

    await makeBranchAndCheckout(repoPath, "feature1");
    await makeCommit(repoPath, "second commit");

    const prInfo = await getPrInfoForSpeculativeBranch(settings, repoPath);

    const deterministicPrInfo = { ...prInfo, base: {}, head: {} };

    expect(deterministicPrInfo).toMatchInlineSnapshot(`
Object {
  "base": Object {},
  "files": Object {
    "added": Array [],
    "changed": Array [],
    "removed": Array [
      "index.js",
    ],
  },
  "head": Object {},
  "id": 0,
  "meta": Object {
    "body": "",
    "title": "",
  },
}
`);
  });
});

async function prepareRepo(repoPath: string): Promise<void> {
  const indexPathAbs = join(repoPath, indexPath);
  fse.removeSync(repoPath);
  fse.mkdirpSync(repoPath);
  await execa("git init", { shell: true, cwd: repoPath });
  await execa(`git config user.name "Codechecks Test"`, { shell: true, cwd: repoPath });
  await execa(`git config user.email "chris@codechecks.io"`, { shell: true, cwd: repoPath });
  await fse.writeFile(indexPathAbs, `console.log("Hello world!");`);

  await makeCommit(repoPath, "init");
}

async function makeCommit(repoPath: string, message: string): Promise<void> {
  await execa("git add -A", { shell: true, cwd: repoPath });
  await execa(`git commit -m "${message}"`, {
    shell: true,
    cwd: repoPath,
  });
}

async function makeBranchAndCheckout(repoPath: string, branchName: string): Promise<void> {
  await execa(`git checkout -b ${branchName}`, { shell: true, cwd: repoPath });
}

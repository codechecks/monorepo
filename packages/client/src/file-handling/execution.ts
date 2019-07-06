import { join, extname } from "path";
import { existsSync } from "fs";

import { Path } from "../utils";
import { executeTs } from "../file-executors/tsExecutor";
import { executeJs } from "../file-executors/jsExecutor";
import { executeCodechecksJson } from "../file-executors/executeJson";
import { executeCodechecksYaml } from "../file-executors/executeYaml";

const CODECHECKS_FILES_NAMES = [
  "codechecks.yml",
  "codechecks.yaml",
  "codechecks.json",
  "codechecks.ts",
  "codechecks.js",
];

export async function executeCodechecksFile(codeChecksFilePath: string): Promise<void> {
  const extension = extname(codeChecksFilePath).slice(1);

  switch (extension) {
    case "ts":
      return await executeTs(codeChecksFilePath);
    case "js":
      return await executeJs(codeChecksFilePath);
    case "json":
      return await executeCodechecksJson(codeChecksFilePath);
    case "yml":
    case "yaml":
      return await executeCodechecksYaml(codeChecksFilePath);
    default:
      throw new Error(`Unsupported file extension ${extension}`);
  }
}

export function findCodechecksFiles(basePath: string): Path[] {
  const existingFiles = CODECHECKS_FILES_NAMES.map(n => join(basePath, n)).filter(filePath => {
    return existsSync(filePath);
  });

  if (existingFiles.length === 0) {
    throw new Error(`Couldnt find CodeChecks files. Checked path: ${basePath}`);
  }

  return existingFiles as any[];
}

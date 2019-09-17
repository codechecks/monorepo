import { join, extname } from "path";
import { existsSync } from "fs";

import { Path } from "../utils";
import { executeTs } from "./tsExecutor";
import { executeJs } from "./jsExecutor";
import { executeCodechecksJson } from "./executeJson";
import { executeCodechecksYaml } from "./executeYaml";
import { crash } from "../utils/errors";

const CODECHECKS_FILES_NAMES = [
  "codechecks.yml",
  "codechecks.yaml",
  "codechecks.json",
  "codechecks.ts",
  "codechecks.js",
];

export async function executeCodechecksFile(codeChecksFilePath: string, options?: any): Promise<void> {
  const extension = extname(codeChecksFilePath).slice(1);

  switch (extension) {
    case "ts":
      return await executeTs(codeChecksFilePath, options);
    case "js":
    case "": // requiring a module
      return await executeJs(codeChecksFilePath, options);
    case "json":
      return await executeCodechecksJson(codeChecksFilePath);
    case "yml":
    case "yaml":
      return await executeCodechecksYaml(codeChecksFilePath);
    default:
      throw crash(`Unsupported file extension ${extension}`);
  }
}

export function findCodechecksFiles(basePath: string): Path[] {
  const existingFiles = CODECHECKS_FILES_NAMES.map(n => join(basePath, n)).filter(filePath => {
    return existsSync(filePath);
  });

  if (existingFiles.length === 0) {
    throw crash(`Couldnt find CodeChecks files. Checked path: ${basePath}`);
  }

  return existingFiles as any[];
}

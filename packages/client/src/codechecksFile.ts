import { join, extname } from "path";
import { existsSync } from "fs";
import { Path } from "./utils";
import { executeTs } from "./file-executors/tsExecutor";
import { executeJs } from "./file-executors/jsExecutor";
import { executeCodechecksJson, loadJson } from "./file-executors/executeJson";
import { executeCodechecksYaml, loadYaml } from "./file-executors/executeYaml";
import { CodeChecksSettings } from "./types";
import { DeepPartial } from "ts-essentials";

const CODECHECKS_FILES_NAMES = [
  "codechecks.yml",
  "codechecks.yaml",
  "codechecks.json",
  "codechecks.ts",
  "codechecks.js",
];
const CODECHECKS_SETTINGS_FILES_NAMES = ["codechecks.yml", "codechecks.yaml", "codechecks.json"];

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

/**
 * Always try loading settings from "codechecks.yml" or "codechecks.json" files.
 */
export async function loadCodechecksSettings(basePath: string): Promise<CodeChecksSettings> {
  const existingFiles = CODECHECKS_SETTINGS_FILES_NAMES.map(n => join(basePath, n)).filter(filePath => {
    return existsSync(filePath);
  });

  const mainSettingsFile = existingFiles[0];

  const userProvidedSettings = mainSettingsFile ? loadSettingsFromFile(mainSettingsFile) : {};

  return normalizeSettings(userProvidedSettings);
}

function loadSettingsFromFile(filePath: string): CodeChecksSettings | undefined {
  const extension = extname(filePath).slice(1);

  switch (extension) {
    case "json":
      return (loadJson(filePath) || {}).settings;
    case "yml":
    case "yaml":
      return (loadYaml(filePath) || {}).settings;
    default:
      throw new Error(`Unsupported file extension ${extension}`);
  }
}

function normalizeSettings(userProvidedSettings: DeepPartial<CodeChecksSettings> = {}): CodeChecksSettings {
  return {
    speculativeBranchSelection: userProvidedSettings.speculativeBranchSelection === false ? false : true,
    speculativeBranches: userProvidedSettings.speculativeBranches || ["master"],
  };
}

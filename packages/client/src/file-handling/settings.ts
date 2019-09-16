import { CodeChecksSettings } from "../types";
import { join, extname } from "path";
import { existsSync } from "fs";
import { loadJson } from "../file-executors/executeJson";
import { loadYaml } from "../file-executors/executeYaml";
import { crash } from "../utils/errors";

const CODECHECKS_SETTINGS_FILES_NAMES = ["codechecks.yml", "codechecks.yaml", "codechecks.json"];

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
      throw crash(`Unsupported file extension ${extension}`);
  }
}

function normalizeSettings(userProvidedSettings: Partial<CodeChecksSettings> = {}): CodeChecksSettings {
  return {
    speculativeBranchSelection: userProvidedSettings.speculativeBranchSelection === false ? false : true,
    branches: userProvidedSettings.branches || ["master"],
  };
}

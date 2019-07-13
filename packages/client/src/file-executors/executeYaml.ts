import * as yaml from "js-yaml";
import { CheckNameMapper, standardNameMapper, executeCodechecksJsonString } from "./executeJson";
import { readFileSync } from "fs";

export async function executeCodechecksYaml(
  path: string,
  checkNameMapper: CheckNameMapper = standardNameMapper(path),
): Promise<void> {
  const json = loadYaml(path);
  return executeCodechecksJsonString(json, checkNameMapper);
}

export function loadYaml(path: string): any {
  const yamlString = readFileSync(path, "utf8");
  return yaml.safeLoad(yamlString);
}

import * as yaml from "js-yaml";
import { CheckNameMapper, standardNameMapper, executeCodechecksJsonString } from "./executeJson";
import { readFileSync } from "fs";

export async function executeCodechecksYaml(
  path: string,
  checkNameMapper: CheckNameMapper = standardNameMapper,
): Promise<void> {
  const yamlString = readFileSync(path, "utf8");
  const json = yaml.safeLoad(yamlString);
  return executeCodechecksJsonString(json, checkNameMapper);
}

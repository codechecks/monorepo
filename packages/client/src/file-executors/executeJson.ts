import { logger } from "../logger";
import { join, dirname } from "path";
import { executeCodechecksFile } from "./execution";
import { crash } from "../utils/errors";

export async function executeCodechecksJson(
  path: string,
  checkNameMapper: CheckNameMapper = standardNameMapper(path),
): Promise<void> {
  const json = loadJson(path);
  return executeCodechecksJsonString(json, checkNameMapper);
}

export function loadJson(path: string): any {
  return require(path);
}

export async function executeCodechecksJsonString(
  json: CodechecksJson,
  checkNameMapper: CheckNameMapper,
): Promise<void> {
  const checks = json.checks;
  for (const check of checks) {
    const moduleName = checkNameMapper(check.name);

    logger.debug(`Executing ${check.name} => ${moduleName}`);

    await executeCodechecksFile(moduleName, check.options);
  }
}

export interface CodechecksJson {
  checks: {
    name: string;
    options?: any;
  }[];
}

export type CheckNameMapper = (name: string) => string;

/**
 * Maps "check" name to node_module dependency.
 *  1. Check if @codechecks/CHECK_NAME exists
 *  2. Check CHECK_NAME
 */
export const standardNameMapper = (path: string) => (checkName: string): string => {
  if (checkIfModuleExists(`@codechecks/${checkName}`)) {
    return `@codechecks/${checkName}`;
  }

  if (checkIfModuleExists(checkName)) {
    return checkName;
  }
  if (checkIfModuleExists(join(dirname(path), checkName))) {
    return join(dirname(path), checkName);
  }

  throw crash(`Module ${checkName} couldn't be found. Tried:
- @codechecks/${checkName}
- ${checkName}
`);
};

function checkIfModuleExists(moduleName: string): boolean {
  try {
    require.resolve(moduleName);
    return true;
  } catch {
    return false;
  }
}

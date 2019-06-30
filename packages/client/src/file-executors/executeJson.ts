import { logger } from "../logger";

export async function executeCodechecksJson(
  path: string,
  checkNameMapper: CheckNameMapper = standardNameMapper,
): Promise<void> {
  const json = require(path);
  return executeCodechecksJsonString(json, checkNameMapper);
}

export async function executeCodechecksJsonString(
  json: CodechecksJson,
  checkNameMapper: CheckNameMapper,
): Promise<void> {
  const checks = json.checks;
  for (const check of checks) {
    const moduleName = checkNameMapper(check.name);

    logger.log(`Executing ${check.name} => ${moduleName}`);
    const module = require(moduleName);
    if (!module.default) {
      throw new Error(`${moduleName} does not have default export`);
    }
    await module.default(check.options);
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
export function standardNameMapper(checkName: string): string {
  if (checkIfModuleExists(`@codechecks/${checkName}`)) {
    return `@codechecks/${checkName}`;
  }

  if (checkIfModuleExists(checkName)) {
    return checkName;
  }

  throw new Error(`Module ${checkName} couldn't be found. Tried: 
- @codechecks/${checkName}
- ${checkName}
`);
}

function checkIfModuleExists(moduleName: string): boolean {
  try {
    require.resolve(moduleName);
    return true;
  } catch (e) {
    return false;
  }
}

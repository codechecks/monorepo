import { existsSync, readFileSync } from "fs";
import { get } from "lodash";
import * as JSON5 from "json5";

import { moduleExecutor } from "./moduleExecutor";
import { logger } from "../logger";

export async function executeTs(filePath: string): Promise<void> {
  const customModuleHandler = (module: any, filename: string) => {
    const compiled = transpileTypescriptModule(filename);
    module._compile(compiled, filename);
  };

  require.extensions[".ts"] = customModuleHandler;
  require.extensions[".tsx"] = customModuleHandler;

  let codeChecksModule;
  try {
    codeChecksModule = require(filePath);
  } catch (e) {
    logger.error("Error while executing CodeChecks file!");
    throw e;
  }

  await moduleExecutor(codeChecksModule);
}

export function transpileTypescriptModule(path: string): string {
  const contents = readFileSync(path, "utf8");
  const isInsideNodeModules = path.indexOf("node_modules") !== -1;
  const hasTypescript = !!require.resolve("typescript");

  let source;

  if (isInsideNodeModules) {
    source = contents;
  } else {
    if (!hasTypescript) {
      throw new Error("File written in TS but typescript package is not installed.");
    }

    source = transpileTypescript(contents);
  }

  if (!source) {
    throw new Error(`Couldnt parse ${path}`);
  }

  return source;
}

function transpileTypescript(path: string): string {
  const ts = require("typescript");

  let compilerOptions: any;
  if (existsSync("tsconfig.json")) {
    compilerOptions = JSON5.parse(readFileSync("tsconfig.json", "utf8"));
  } else {
    compilerOptions = ts.getDefaultCompilerOptions();
  }
  if (get(compilerOptions, "compilerOptions.module")) {
    compilerOptions.compilerOptions.module = "commonjs";
  }

  let result = ts.transpileModule(path, compilerOptions);
  return result.outputText;
}

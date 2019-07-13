import { moduleExecutor } from "./moduleExecutor";
import { logger } from "../logger";

export async function executeJs(filePath: string, options: any): Promise<void> {
  let codeChecksModule;
  try {
    codeChecksModule = require(filePath);
  } catch (e) {
    logger.error("Error while executing CodeChecks file!");
    throw e;
  }

  await moduleExecutor(codeChecksModule, options);
}

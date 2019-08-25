#!/usr/bin/env node

require("./utils/hijackModuleLoading");

import { inspect } from "util";
import * as program from "commander";
import ms = require("ms");

import { findProvider } from "./ci-providers";
import { getExecutionContext, getConstExecutionContext } from "./getExecutionContext";
import { Api, getApiOptions } from "./api";
import { CodechecksClient } from "./client";
import { normalizePath, Path, maskSecrets } from "./utils";
import { executeCodechecksFile, findCodechecksFiles } from "./file-executors/execution";
import { codechecks as globalClient } from ".";
import { checkIfIsLocalMode } from "./ci-providers/Local";
import { logger, printLogo, bold, formatSHA, formatPath } from "./logger";
import { loadCodechecksSettings } from "./file-handling/settings";
import { findRootGitRepository } from "./utils/git";
import { CodeChecksClientArgs } from "./types";

async function main(args: CodeChecksClientArgs, codecheckFiles: Path[] = findCodechecksFiles(process.cwd())): Promise<void> {
  const { project } = args;
  printLogo();
  logger.log(`Executing ${bold(codecheckFiles.length)} codechecks files`);
  const startTime = new Date().getTime();

  const provider = findProvider(process.env, project);
  const requiresSecret = checkIfIsLocalMode(provider) || (await provider.isFork());
  const api = new Api(getApiOptions(requiresSecret));
  if ((provider as any).setApi) {
    (provider as any).setApi(api);
  }

  const gitRoot = findRootGitRepository(process.cwd());
  if (!gitRoot) {
    throw new Error("Couldn't find git project root!");
  }
  const settings = await loadCodechecksSettings(gitRoot);
  const sharedExecutionCtx = await getConstExecutionContext(api, provider, settings, gitRoot, args);
  logger.debug({ sharedExecutionCtx });

  (api as any).sharedCtx = sharedExecutionCtx;

  if (sharedExecutionCtx.isFork) {
    logger.log("Running for fork!");
  }
  if (sharedExecutionCtx.isLocalMode) {
    logger.log("Running in local mode!");
  }
  if (sharedExecutionCtx.isPr) {
    logger.log(`Base branch: ${bold(formatSHA(sharedExecutionCtx.pr!.base.sha))}`);
  }
  console.log();

  for (const codecheckFile of codecheckFiles) {
    logger.log(`Executing ${bold(formatPath(codecheckFile, gitRoot))}...`);
    logger.log();
    // do not use this instance after clone
    const fileExecutionCtx = getExecutionContext(sharedExecutionCtx, codecheckFile);
    logger.debug({ fileExecutionCtx });
    const _client = new CodechecksClient(api, fileExecutionCtx);
    replaceObject(globalClient, _client);
    (global as any).__codechecks_client = _client;

    await executeCodechecksFile(codecheckFile);
  }

  const finishTime = new Date().getTime();
  const deltaTime = finishTime - startTime;

  logger.log(`All done in ${bold(ms(deltaTime))}!`);
}

const command = program
  .version(require("../package.json").version)
  .option("-p, --project [projectSlug]", "Project slug, works only in local mode")
  .option("--fail-fast", "Stops running checks after the first failure, works only in local mode")
  .usage("codechecks [codechecks.yml|json|ts|js]")
  .parse(process.argv);

const args: CodeChecksClientArgs = {
  project: command.project,
  failFast: command.failFast,
};

main(args, command.args.length > 0 ? command.args.map(a => normalizePath(a)) : undefined).catch(e => {
  // we want informative output but we don't want leaking secrets into any logs
  logger.error(maskSecrets(e.message, process.env));
  logger.debug(maskSecrets(inspect(e), process.env));
  process.exit(1);
});

// @todo is there a way to avoid doing prototype shenanigans also without polluting index.js by introducing something like __setClient?
function replaceObject(old: object, newObject: object): void {
  Object.assign(old, newObject);
  (old as any).__proto__ = (newObject as any).__proto__;
}

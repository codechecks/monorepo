#!/usr/bin/env node
import { inspect } from "util";
import * as program from "commander";
import ms = require("ms");

import { findProvider } from "./ci-providers";
import { getExecutionContext, getConstExecutionContext } from "./getExecutionContext";
import { Api, getApiOptions } from "./api";
import { CodechecksClient } from "./client";
import { normalizePath, Path, maskSecrets } from "./utils";
import { executeCodechecksFile, findCodechecksFiles } from "./codechecksFile";
import { codechecks as globalClient } from ".";
import { checkIfIsLocalMode } from "./ci-providers/Local";
import { logger } from "./logger";

async function main(project?: string, codecheckFiles: Path[] = findCodechecksFiles(process.cwd())): Promise<void> {
  logger.log("Running codechecks!");
  logger.log(`Executing ${codecheckFiles.length} codechecks files`);
  const startTime = new Date().getTime();

  const provider = findProvider(process.env, project);
  const requiresSecret = checkIfIsLocalMode(provider) || (await provider.isFork());
  const api = new Api(getApiOptions(requiresSecret));
  if ((provider as any).setApi) {
    (provider as any).setApi(api);
  }

  // @todo tmp. just to silent tsc
  const settings: any = {};
  const sharedExecutionCtx = await getConstExecutionContext(api, provider, settings, process.cwd());

  if (sharedExecutionCtx.isFork) {
    logger.log("Running for fork!");
  }
  if (sharedExecutionCtx.isLocalMode) {
    logger.log("Running in local mode!");
  }

  for (const codecheckFile of codecheckFiles) {
    logger.log(`Executing ${codecheckFile}...`);
    // do not use this instance after clone
    const _client = new CodechecksClient(api, getExecutionContext(sharedExecutionCtx, codecheckFile));
    replaceObject(globalClient, _client);

    await executeCodechecksFile(codecheckFile);
  }

  const finishTime = new Date().getTime();
  const deltaTime = finishTime - startTime;

  logger.log(`All done in ${ms(deltaTime)}!`);
}

const command = program
  .version(require("../package.json").version)
  .option("-p, --project [projectSlug]", "Project slug, useful only in local mode, otherwise ignored")
  .usage("codechecks [codechecks.yml|json|ts|js]")
  .parse(process.argv);

main(command.project, command.args.length > 0 ? command.args.map(a => normalizePath(a)) : undefined).catch(e => {
  // we want informative output but we don't want leaking secrets into any logs
  logger.error(maskSecrets(inspect(e), process.env));
  process.exit(1);
});

// @todo is there a way to avoid doing prototype shenanigans also without polluting index.js by introducing something like __setClient?
function replaceObject(old: object, newObject: object): void {
  Object.assign(old, newObject);
  (old as any).__proto__ = (newObject as any).__proto__;
}

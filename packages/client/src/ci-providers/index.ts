import { LocalProvider, checkIfIsLocalMode } from "./Local";
import { Circle } from "./Circle";
import { Travis } from "./Travis";
import { Semaphore } from "./Semaphore";
import { BuildKite } from "./BuildKite";
import { GithubActions } from "./GithubActions";

import { CiProvider, Env } from "./types";
import { crash } from "../utils/errors";
import { logger } from "../logger";

const providers: { new (env: Env, localProject?: string): CiProvider }[] = [
  Circle,
  Travis,
  Semaphore,
  BuildKite,
  LocalProvider,
  GithubActions,
];

// @todo refactor passing CLI options
export function findProvider(env: Env, localProject?: string): CiProvider {
  const providerInstances = providers.map(Provider => new Provider(env, localProject));

  let currentlyRunningProviders = providerInstances.filter(p => p.isCurrentlyRunning());
  if (currentlyRunningProviders.length === 0) {
    throw crash("Could not find running CI.");
  }
  if (currentlyRunningProviders.length > 1) {
    logger.debug("Detected more than 1 CI providers, ignoring local provider");
    // if there is more than one CI provider ignore local provider
    // this is done because it's hard to realize if we ran on ANY CI
    currentlyRunningProviders = currentlyRunningProviders.filter(ci => !checkIfIsLocalMode(ci));
  }
  if (currentlyRunningProviders.length > 1) {
    throw crash(
      `Found more than 1 running CI! Found CIs: ${currentlyRunningProviders.map(ci => getClassName(ci)).join(", ")}`,
    );
  }
  return currentlyRunningProviders[0];
}

function getClassName(instance: any): string {
  return instance.constructor.name || "unnamed class";
}

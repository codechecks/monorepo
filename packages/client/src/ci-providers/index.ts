import { LocalProvider } from "./Local";
import { Circle } from "./Circle";
import { Travis } from "./Travis";
import { Semaphore } from "./Semaphore";
import { BuildKite } from "./BuildKite";
import { GithubActions } from "./GithubActions";

import { CiProvider, Env } from "./types";
import { crash } from "../utils/errors";

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

  const currentlyRunningProviders = providerInstances.filter(p => p.isCurrentlyRunning());
  if (currentlyRunningProviders.length === 0) {
    throw crash("Could not find running CI.");
  }
  if (currentlyRunningProviders.length > 1) {
    throw crash(`Found more than 1 running CI! Found CIs: ${getClassName(currentlyRunningProviders)}`);
  }
  return currentlyRunningProviders[0];
}

function getClassName(instance: any): string {
  return instance.constructor.name || "unnamed class";
}

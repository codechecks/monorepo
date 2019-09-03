import { LocalProvider } from "./Local";
import { Circle } from "./Circle";
import { Travis } from "./Travis";
import { Semaphore } from "./Semaphore";
import { BuildKite } from "./BuildKite";
import { Github } from "./Github";

import { CiProvider, Env } from "./types";
import { crash } from "../utils/errors";

const providers: { new (env: Env, localProject?: string): CiProvider }[] = [
  Circle,
  Travis,
  Semaphore,
  BuildKite,
  LocalProvider,
  Github,
];

// @todo refactor passing CLI options
export function findProvider(env: Env, localProject?: string): CiProvider {
  const providerInstances = providers.map(Provider => new Provider(env, localProject));

  const currentlyRunningProviders = providerInstances.filter(p => p.isCurrentlyRunning());
  if (currentlyRunningProviders.length === 0) {
    throw crash("Could not find running CI.");
  }
  if (currentlyRunningProviders.length > 1) {
    throw crash("Found more than 1 running CI o_O");
  }
  return currentlyRunningProviders[0];
}

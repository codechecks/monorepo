import { Circle } from "./Circle";
import { Travis } from "./Travis";
import { BuildKite } from "./BuildKite";
import { CiProvider, Env } from "./types";
import { LocalProvider } from "./Local";

const providers: { new (env: Env, localProject?: string): CiProvider }[] = [Circle, Travis, BuildKite, LocalProvider];

// @todo refactor passing CLI options
export function findProvider(env: Env, localProject?: string): CiProvider {
  const providerInstances = providers.map(Provider => new Provider(env, localProject));

  const currentlyRunningProviders = providerInstances.filter(p => p.isCurrentlyRunning());
  if (currentlyRunningProviders.length === 0) {
    throw new Error("Could not find running CI.");
  }
  if (currentlyRunningProviders.length > 1) {
    throw new Error("Found more than 1 running CI o_O");
  }
  return currentlyRunningProviders[0];
}

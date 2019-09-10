import { AsyncOrSync } from "ts-essentials";
import { mapValues } from "lodash";
import { Dictionary } from "ts-essentials";
const promiseAll = require("promise-all");

export type DisposableResource<T> = {
  resource: T;
  dispose: () => AsyncOrSync<any>;
};

declare type DisposableResourceMap<T> = {
  [P in keyof T]: T[P] extends () => AsyncOrSync<DisposableResource<infer R>> ? R : never
};
export async function using<T extends Dictionary<() => AsyncOrSync<DisposableResource<any>>>>(
  disposable: T,
  fn: (resources: DisposableResourceMap<T>) => any,
): Promise<void> {
  const allDisposablePromises = promiseAll(mapValues(disposable, d => d()));
  const resources = await Promise.all(allDisposablePromises);
  await fn(resources as any); 
  const disposeAllResources = (resources as any).map((r: any) => r());
  await disposeAllResources;
}

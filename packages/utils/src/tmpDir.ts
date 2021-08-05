import { dir } from "tmp-promise";
import { DisposableResource } from "./using";
import { createDebug } from "./createDebug";

const SHARED_PREFIX = "codechecks";

const debug = createDebug("utils/tmp-dir");

export async function createTmpDir(): Promise<string> {
  const { path: tmpPathDir } = await dir({ prefix: SHARED_PREFIX });
  debug(`Created tmp dir:`, tmpPathDir);

  return tmpPathDir;
}

export async function disposableTmpDir(): Promise<DisposableResource<string>> {
  const tmpDir = await dir({ prefix: SHARED_PREFIX });
  debug(`Created tmp dir:`, tmpDir.path);

  return {
    resource: tmpDir.path,
    dispose: async () => {
      debug(`Deleting tmp dir:`, tmpDir.path);
      await tmpDir.cleanup();
    },
  };
}

import { dir } from "tmp-promise";

export async function tmpDir(): Promise<string> {
  const { path: tmpPathDir } = await dir({ prefix: "codechecks" });

  return tmpPathDir;
}

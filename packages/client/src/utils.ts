import { Opaque, Dictionary } from "ts-essentials";
import { resolve, isAbsolute } from "path";

export function runOrCatchError<T>(fn: () => T): T | undefined {
  try {
    return fn();
  } catch {
    return undefined;
  }
}

export function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (value === undefined) {
    throw new Error(`Required env var ${name} missing`);
  }

  return value;
}

export function normalizePath(absoluteOrRelativePath: string): Path {
  return resolve(absoluteOrRelativePath) as any;
}

export type Path = Opaque<string, "PATH">;

export function maskSecrets(output: string, env: Dictionary<string | undefined>): string {
  const secret = env["CC_SECRET"];
  if (!secret) {
    return output;
  }

  return output.split(secret).join("###");
}

export function ensureAbsolutePath(path: string): void {
  if (!isAbsolute(path)) {
    throw new Error(`${path} has to be an absolute path!`);
  }
}

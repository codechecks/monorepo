import * as dotenv from "dotenv";
import { readFileSync } from "fs";

import { Env } from "../types";

export function readEnvFile(path: string): Env {
  const envFile = readFileSync(path, "utf8");
  return dotenv.parse(envFile);
}

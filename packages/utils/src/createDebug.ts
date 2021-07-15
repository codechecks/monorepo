import * as debugLib from "debug";

export function createDebug(name: string): debugLib.Debugger {
  return debugLib(`codechecks:${name}`);
}

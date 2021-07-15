import * as execa from "execa";
import { Readable } from "stream";
import { createDebug } from "./createDebug";
import { Debugger } from "debug";

interface SharedOptions extends execa.CommonOptions<string> {}

interface ExecuteOptions extends SharedOptions {
  file: string;
  args?: string[];
}
interface ExecuteCommandOptions extends SharedOptions {
  cmd: string;
}

type ExecuteResult = execa.ExecaChildProcess;

export function execute(options: ExecuteOptions): ExecuteResult {
  const executionResult = execa(options.file, options.args, options);
  logResult(executionResult, "execute");
  return executionResult;
}

export function executeCommand(options: ExecuteCommandOptions): ExecuteResult {
  const executionResult = (execa as any).command(options.cmd, options);
  logResult(executionResult, "executeCommand");
  return executionResult;
}

function logResult(result: ExecuteResult, namespace: string): void {
  function logStream(stream: Readable, debug: Debugger): void {
    stream.on("close", () => debug("close"));
    stream.on("error", (e: any) => debug("error", e));
    stream.on("end", () => debug("end"));
    stream.on("data", (data: any) => debug(data.toString()));
  }

  const outDebug = createDebug(`utils:${namespace}:out`);
  logStream(result.stdout, outDebug);
  const errDebug = createDebug(`utils:${namespace}:err`);
  logStream(result.stderr, errDebug);
}

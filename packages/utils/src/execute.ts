import * as execa from "execa";

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
  return execa(options.file, options.args, options);
}

export function executeCommand(options: ExecuteCommandOptions): ExecuteResult {
  return (execa as any).command(options.cmd, options);
}

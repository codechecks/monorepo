import * as execa from "execa";
import * as stream from "stream";

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
  return execa.command(options.cmd, options);
}

function timeoutIfNoData(stream: stream.Readable, interval: number, fn: Function): void {
  // probably we could convert nodejs stream to rxjs and avoid this code
  let timeoutHook = setTimeout(fn, interval);

  stream.on("data", () => {
    clearTimeout(timeoutHook);
    timeoutHook = setTimeout(fn, interval);
  });

  stream.on("error", () => {
    clearTimeout(timeoutHook);
  });

  stream.on("close", () => {
    clearTimeout(timeoutHook);
  });
  stream.on("end", () => {
    clearTimeout(timeoutHook);
  });
}

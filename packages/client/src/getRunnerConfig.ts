import { CodeChecksClientArgs, RunnerConfig } from "./types";

export function getRunnerConfig(args: CodeChecksClientArgs): RunnerConfig {
  return {
    isWithExitStatus: !!args.withExitStatus,
  };
}

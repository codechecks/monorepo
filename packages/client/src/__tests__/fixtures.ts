import { CodeChecksReport } from "../types";
import { ExecutionContext } from "../getExecutionContext";

export function fixtureFactory<T>(defaults: T): (params?: Partial<T>) => T {
  return (params = {}) => ({ ...defaults, ...params });
}

export const reportFixture = fixtureFactory<CodeChecksReport>({
  name: "Build Size",
  shortDescription: "[...]",
  longDescription: "[...]",
  status: "success",
});

export const contextFixture: (params?: Partial<ExecutionContext>) => ExecutionContext = fixtureFactory<
  ExecutionContext
>({
  codeChecksFileAbsPath: "/codechecks.yml",
  workspaceRoot: "/",
  isPr: true,
  isPrivate: false,
  projectSlug: "codechecks/monorepo",
  artifactsProxy: { url: "https://artifacts.codechecks.io/", supportsPages: true },
  currentSha: "5fe201cd36d2878b8a34f717207c94f9724aef45",
  isLocalMode: { projectSlug: "codechecks/monorepo", isOffline: false, isFailFast: false },
  pr: {
    id: 0,
    meta: { title: "Local run", body: "local run" },
    files: { added: [], changed: [], removed: [] },
    head: { sha: "5fe201cd36d2878b8a34f717207c94f9724aef45" },
    base: { sha: "c7bb7435e90418edb032e61eadbd89bfcb5d01c1" },
  },
  isFork: false,
  isSpeculativePr: false,
  isWithExitStatus: false,
});

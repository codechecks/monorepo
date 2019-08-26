import { processReport } from "../Local";
import { CodeChecksReport } from "client/src/types";
import { ExecutionContext } from "client/src/getExecutionContext";
import { logger } from "../../logger";
import { fixtureFactory } from "./utils";

const reportFixture = fixtureFactory<CodeChecksReport>({
  name: "Build Size",
  shortDescription: "[...]",
  longDescription: "[...]",
  status: "success",
});

const contextFixture = fixtureFactory<ExecutionContext>({
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
});

jest.mock("../../logger.ts");

afterEach(() => {
  jest.clearAllMocks();
});

describe("Local", () => {
  describe("processReport", () => {
    it("doesn't log critical error for successful report", () => {
      processReport(reportFixture({ status: "success" }), contextFixture());
      expect(logger.critical).not.toHaveBeenCalled();
    });

    it("doesn't log critical error for failed report without fail fast mode", () => {
      processReport(reportFixture({ status: "failure" }), contextFixture());
      expect(logger.critical).not.toHaveBeenCalled();
    });

    it("logs critical error for failed report in fail fast mode", () => {
      const context = contextFixture({
        isLocalMode: { projectSlug: "codechecks/monorepo", isOffline: false, isFailFast: true },
      });
      processReport(reportFixture({ status: "failure" }), context);
      expect(logger.critical).toHaveBeenCalledWith('"Build Size" check failed in fail fast mode');
    });
  });
});

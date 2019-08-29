import { processReport } from "../Local";
import { logger } from "../../logger";
import { contextFixture, reportFixture } from "../../__tests__/fixtures";

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

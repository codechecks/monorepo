import { join } from "path";

import { readEnvFile } from "./utils";
import { Circle } from "../Circle";

describe("Circle", () => {
  describe("no-pr env", () => {
    const envPr = readEnvFile(join(__dirname, "__fixtures__", "circle/pr.env"));

    it("should detect circleci", () => {
      const provider = new Circle(envPr);

      expect(provider.isCurrentlyRunning()).toBe(true);
    });

    it("should not detect circleci when not running inside circleci", () => {
      const provider = new Circle({});

      expect(provider.isCurrentlyRunning()).toBe(false);
    });

    it("retrieves info", () => {
      const provider = new Circle(envPr);

      expect(provider.getPullRequestID()).toBe(10);
      expect(provider.getCurrentSha()).toBe("711a2ba0e24c74b5e818dc0b130912db61e804fe");
      expect(provider.getProjectSlug()).toBe("krzkaczor/Super-CI");
      expect(provider.isFork()).toBe(false);
    });
  });

  describe("no pr env", () => {
    const envNoPR = readEnvFile(join(__dirname, "__fixtures__", "circle/nopr.env"));

    it("retrieves info", () => {
      const provider = new Circle(envNoPR);

      expect(provider.getPullRequestID()).toBeUndefined();
      expect(provider.getCurrentSha()).toBe("23f5024d48eabb4adff2bd3c62aea8decbf20be0");
      expect(provider.getProjectSlug()).toBe("codechecks/monorepo");
      expect(provider.isFork()).toBe(false);
    });
  });

  describe("first fork mode", () => {
    const envFork = readEnvFile(join(__dirname, "__fixtures__", "circle/fork.env"));
    it("retrieves info", () => {
      const provider = new Circle(envFork);

      expect(provider.isFork()).toBe(true);
      expect(provider.getProjectSlug()).toBe("krzkaczor/Super-CI");
      expect(provider.getPullRequestID()).toBe(10);
    });
  });

  describe("second fork mode", () => {
    const envFork2 = readEnvFile(join(__dirname, "__fixtures__", "circle/fork2.env"));

    it("retrieves info", () => {
      const provider = new Circle(envFork2);

      expect(provider.isFork()).toBe(true);
      expect(provider.getProjectSlug()).toBe("nestjs/nest");
      expect(provider.getPullRequestID()).toBe(2888);
    });
  });
});

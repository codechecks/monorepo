import { join } from "path";

import { readEnvFile } from "./utils";
import { Circle } from "../Circle";

describe("Circle", () => {
  const env = readEnvFile(join(__dirname, "__fixtures__", "circle/pr.env"));
  const envFork = readEnvFile(join(__dirname, "__fixtures__", "circle/fork.env"));
  const envNoPR = readEnvFile(join(__dirname, "__fixtures__", "circle/nopr.env"));

  it("should detect circleci", () => {
    const provider = new Circle(env);

    expect(provider.isCurrentlyRunning()).toBe(true);
  });

  it("should not detect circleci when not running inside circleci", () => {
    const provider = new Circle({});

    expect(provider.isCurrentlyRunning()).toBe(false);
  });

  it("should get pull request id", () => {
    const provider = new Circle(env);

    expect(provider.getPullRequestID()).toBe(10);
  });

  it("should not get pull request id if not running in PR context", () => {
    const provider = new Circle(envNoPR);

    expect(provider.getPullRequestID()).toBeUndefined();
  });

  it("should get target SHA", () => {
    const provider = new Circle(env);

    expect(provider.getCurrentSha()).toBe("711a2ba0e24c74b5e818dc0b130912db61e804fe");
  });

  it("should not detect fork mode", () => {
    const provider = new Circle(env);

    expect(provider.isFork()).toBe(false);
  });

  it("should detect fork mode", () => {
    const provider = new Circle(envFork);

    expect(provider.isFork()).toBe(true);
  });
});

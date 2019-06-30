import { join } from "path";
import { expect } from "chai";

import { readEnvFile } from "./utils";
import { Circle } from "../Circle";

describe("Circle", () => {
  const env = readEnvFile(join(__dirname, "__fixtures__", ".circleci.env"));
  const envFork = readEnvFile(join(__dirname, "__fixtures__", ".circleci-fork.env"));

  it("should detect circleci", () => {
    const provider = new Circle(env);

    expect(provider.isCurrentlyRunning()).to.be.true;
  });

  it("should not detect circleci when not running inside circleci", () => {
    const provider = new Circle({});

    expect(provider.isCurrentlyRunning()).to.be.false;
  });

  it("should get pull request id", () => {
    const provider = new Circle(env);

    expect(provider.getPullRequestID()).to.be.eq(10);
  });

  it("should not get pull request id if not running in PR context", () => {
    const env = readEnvFile(join(__dirname, "__fixtures__", ".circleci-nopr.env"));
    const provider = new Circle(env);

    expect(provider.getPullRequestID()).to.be.undefined;
  });

  it("should get target SHA", () => {
    const provider = new Circle(env);

    expect(provider.getCurrentSha()).to.be.eq("711a2ba0e24c74b5e818dc0b130912db61e804fe");
  });

  it("should not detect fork mode", () => {
    const provider = new Circle(env);

    expect(provider.isFork()).to.be.eq(false);
  });

  it("should detect fork mode", () => {
    const provider = new Circle(envFork);

    expect(provider.isFork()).to.be.eq(true);
  });
});

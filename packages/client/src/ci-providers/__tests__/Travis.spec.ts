import { join } from "path";
import { expect } from "chai";

import { readEnvFile } from "./utils";
import { Travis } from "../Travis";

describe("Travis", () => {
  const env = readEnvFile(join(__dirname, "__fixtures__", ".travisci.env"));
  const envFork = readEnvFile(join(__dirname, "__fixtures__", ".travisci-fork.env"));

  it("should detect travisci", () => {
    const provider = new Travis(env);

    expect(provider.isCurrentlyRunning()).to.be.true;
  });

  it("should not detect travisci when not running inside travisci", () => {
    const provider = new Travis({});

    expect(provider.isCurrentlyRunning()).to.be.false;
  });

  it("should get pull request id", () => {
    const provider = new Travis(env);

    expect(provider.getPullRequestID()).to.be.eq(18);
  });

  it("should not get pull request id if not running in PR context", () => {
    const env = readEnvFile(join(__dirname, "__fixtures__", ".travisci-nopr.env"));
    const provider = new Travis(env);

    expect(provider.getPullRequestID()).to.be.undefined;
  });

  it("should get target SHA", () => {
    const provider = new Travis(env);

    expect(provider.getCurrentSha()).to.be.eq("aa775e60cfcf836fece903664a5ebc92f464d281");
  });

  it("should not detect fork mode", () => {
    const provider = new Travis(env);

    expect(provider.isFork()).to.be.eq(false);
  });

  it("should detect fork mode", () => {
    const provider = new Travis(envFork);

    expect(provider.isFork()).to.be.eq(true);
  });
});
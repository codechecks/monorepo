import { join } from "path";

import { readEnvFile } from "./utils";
import { Semaphore } from "../Semaphore";

describe("Semaphore", () => {
  const env = readEnvFile(join(__dirname, "__fixtures__", "/semaphore/nopr.env"));

  it("should detect Semaphoreci", () => {
    const provider = new Semaphore(env);

    expect(provider.isCurrentlyRunning()).toBe(true);
  });

  it("should not detect get PR id when not running inside Semaphoreci", () => {
    const provider = new Semaphore({});

    expect(provider.isCurrentlyRunning()).toBe(false);
  });

  it("should not get pull request because we can't get it from semaphore", () => {
    const provider = new Semaphore(env);

    expect(provider.getPullRequestID()).toBe(undefined);
  });

  it("should get target SHA", () => {
    const provider = new Semaphore(env);

    expect(provider.getCurrentSha()).toBe("c30867648887f9d6591391287cd633093e9a965b");
  });

  it("should not detect fork mode", () => {
    const provider = new Semaphore(env);

    expect(provider.isFork()).toBe(false);
  });
});

import { getRunnerConfig } from "../getRunnerConfig";

describe("getRunnerConfig", () => {
  it("sets isWithExitStatus from client args", () => {
    expect(getRunnerConfig({ withExitStatus: undefined }).isWithExitStatus).toEqual(false);
    expect(getRunnerConfig({ withExitStatus: false }).isWithExitStatus).toEqual(false);
    expect(getRunnerConfig({ withExitStatus: true }).isWithExitStatus).toEqual(true);
  });
});

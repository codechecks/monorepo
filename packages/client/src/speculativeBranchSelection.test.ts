import { findSpeculativeBaseBranch } from "./speculativeBranchSelection";

describe("speculativeBranchSelection", () => {
  describe("findSpeculativeBaseBranch", () => {
    it("should return first matching branch", () => {
      const branches = ["master", "develop", "foobar"];

      expect(findSpeculativeBaseBranch("develop", branches)).toBe("develop");
    });

    it("should support matching branch with glob pattern", () => {
      const branches = ["master", "v*-maintenance"];

      expect(findSpeculativeBaseBranch("v1-maintenance", branches)).toBe("v1-maintenance");
    });

    it("should return first configured branch by default", () => {
      const branches = ["master", "develop"];

      expect(findSpeculativeBaseBranch("someBranch", branches)).toBe("master");
    });
  });
});

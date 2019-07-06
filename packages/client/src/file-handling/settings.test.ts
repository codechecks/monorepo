import * as mockFS from "mock-fs";
import { join } from "path";
import { loadCodechecksSettings } from "./settings";

const rootVirtualPath = "/app/";

describe("loadCodechecksSettings", () => {
  it("should load default settings if no files were provided", async () => {
    mockFS({
      [join(rootVirtualPath)]: {},
    });

    const actualSettings = await loadCodechecksSettings(rootVirtualPath);

    mockFS.restore();
    expect(actualSettings).toMatchInlineSnapshot(`
Object {
  "speculativeBranchSelection": true,
  "speculativeBranches": Array [
    "master",
  ],
}
`);
  });

  it("should load settings from codechecks.yml file", async () => {
    mockFS({
      [join(rootVirtualPath)]: {
        "codechecks.yml": `
checks:
  - not-important-check
settings:
  speculativeBranches:
    - dev
    - master
`,
      },
    });

    const actualSettings = await loadCodechecksSettings(rootVirtualPath);

    mockFS.restore();
    expect(actualSettings).toMatchInlineSnapshot(`
Object {
  "speculativeBranchSelection": true,
  "speculativeBranches": Array [
    "dev",
    "master",
  ],
}
`);
  });

  it("should load settings from codechecks.json file", async () => {
    mockFS({
      [join(rootVirtualPath)]: {
        "codechecks.yml": `
{
  "settings": {
    "speculativeBranches": ["dev", "master"]
  }
}
        
        `,
      },
    });

    const actualSettings = await loadCodechecksSettings(rootVirtualPath);

    mockFS.restore();
    expect(actualSettings).toMatchInlineSnapshot(`
Object {
  "speculativeBranchSelection": true,
  "speculativeBranches": Array [
    "dev",
    "master",
  ],
}
`);
  });
});

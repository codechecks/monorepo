import { executeCodechecksFile } from "../file-executors/execution";
import { join } from "path";
import { CodechecksJson, executeCodechecksJsonString } from "../file-executors/executeJson";

describe("executeCodechecksFiles", () => {
  // NOTE: these tests do not make awful lot of sense since everything is ran with ts-node anyway
  it("should work with typescript", async () => {
    const filenames = [
      join(__dirname, "./modules/export-default.ts"),
      join(__dirname, "./modules/export-named.ts"),
      join(__dirname, "./modules/export-commonjs.ts"),
    ];

    for (const filename of filenames) {
      await executeCodechecksFile(filename);

      // any better idea to communicate between modules?
      expect((global as any)[filename]).toBe(true);
    }
  });

  it("should work with javascript", async () => {
    const filenames = [join(__dirname, "./modules/export-commonjs.js")];

    for (const filename of filenames) {
      await executeCodechecksFile(filename);

      expect((global as any)[filename]).toBe(true);
    }
  });

  it("should work with json", async () => {
    const dummyJsonConfig: CodechecksJson = {
      checks: [{ name: "build-size-watcher", options: { paths: [{ path: "build/**/*.js" }] } }],
    };

    const moduleFullPath = join(__dirname, "./modules/loaded-by-json.ts");

    const dummyNameResolver = (checkName: string): string => {
      expect(checkName).toBe("build-size-watcher");

      return moduleFullPath;
    };

    await executeCodechecksJsonString(dummyJsonConfig, dummyNameResolver);
    expect((global as any)[moduleFullPath]).toBe(true);
  });
});

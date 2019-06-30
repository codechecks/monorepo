/**
 * Fix autoimports issues in VSCode
 * https://github.com/Microsoft/TypeScript/issues/30471
 */
declare module "console" {
  export = typeof import("console");
}

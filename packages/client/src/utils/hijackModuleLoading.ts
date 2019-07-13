import { join } from "path";

/**
 * We need to point all requires to @codechecks/client to this module. Not some other being dev dependency because only this one is setup correctly. This is useful for local development.
 */
const REGEX = /@codechecks\/client\/dist\/(.*)/;

const originalHook = require.extensions[".js"];
require.extensions[".js"] = (module, file) => {
  const matches = file.match(REGEX);
  if (matches && !file.startsWith(__dirname)) {
    file = join(__dirname, "..", matches[1]);
  }
  originalHook(module, file);
};

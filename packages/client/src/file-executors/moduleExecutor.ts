import { isFunction } from "util";
import { crash } from "../utils/errors";

export async function moduleExecutor(module: any, options: any): Promise<void> {
  const hasDefaultExport = !!module.default;
  const hasMainExport = !!module.main;
  const hasDefaultCommonExport = isFunction(module);
  if (!hasDefaultExport && !hasMainExport && !hasDefaultCommonExport) {
    throw crash("Your CodeChecks file has to export default export or function named 'main'");
  }
  if ([hasDefaultExport, hasMainExport, hasDefaultCommonExport].filter(x => x === true).length > 1) {
    throw crash(
      "Your CodeChecks file can't export default export, 'main' function and default commonjs export at the same time!",
    );
  }

  let fn!: Function;
  if (hasMainExport) {
    fn = module.main;
  }
  if (hasDefaultExport) {
    fn = module.default;
  }
  if (hasDefaultCommonExport) {
    fn = module;
  }

  await fn(options);
}

import { codechecks } from "@codechecks/client";
import { execSync } from "child_process";
import * as fs from "fs";

export default async () => {
  // Build your project first
  execSync("npm run build");

  // Get the build size (example: dist folder)
  const buildSize = getFolderSize("./dist");

  // Save current build size as an artifact
  await codechecks.saveValue("build-size", { size: buildSize });

  // Compare with baseline (from the main branch)
  const baseline = await codechecks.getValue<{ size: number }>("build-size");

  if (baseline) {
    const diff = buildSize - baseline.size;
    const sign = diff >= 0 ? "+" : "-";

    await codechecks.success({
      name: "Build Size Check",
      shortDescription: `Build size: ${buildSize} bytes (${sign}${Math.abs(diff)} bytes)`,
      longDescription: `## Build Size Report\n| | Size |\n|---|---|\n| Current | ${buildSize} bytes |\n| Baseline | ${baseline.size} bytes |\n| Diff | ${sign}${Math.abs(diff)} bytes |`,
    });
  } else {
    await codechecks.success({
      name: "Build Size Check",
      shortDescription: `Build size: ${buildSize} bytes (no baseline yet)`,
      longDescription: `## Build Size Report\nFirst run — baseline saved.`,
    });
  }
};

function getFolderSize(folderPath: string): number {
  // Simple size calculation — customize as needed
  const files = fs.readdirSync(folderPath);
  return files.reduce((total, file) => {
    const stats = fs.statSync(`${folderPath}/${file}`);
    return total + stats.size;
  }, 0);
}
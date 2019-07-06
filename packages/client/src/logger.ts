// types for debug library suck so we dont use them
const debug = require("debug")("codechecks:client");
import chalk from "chalk";
import { relative } from "path";

export function printLogo(): void {
  console.log(
    `${chalk.magentaBright("code")}${chalk.bold(chalk.magenta("checks"))} Client ${chalk.dim(
      `v.${require("../package.json").version}`,
    )}`,
  );
  console.log();
}

export function bold(input: string | number): string {
  return chalk.bold(input.toString());
}

export function formatSHA(sha: string): string {
  return sha.slice(0, 8);
}

export function formatPath(path: string, rootPath: string): string {
  return relative(rootPath, path);
}

class Logger {
  log(...args: any[]): void {
    console.log(...args);
  }

  debug(...args: any[]): void {
    debug(...args);
  }

  error(...args: any[]): void {
    console.error(chalk.red("Error occured: "), ...args);
  }
}

export const logger = new Logger();

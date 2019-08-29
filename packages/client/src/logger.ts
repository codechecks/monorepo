// types for debug library suck so we dont use them
const debug = require("debug")("codechecks:client");
import chalk from "chalk";
import { relative } from "path";

export function printLogo(): void {
  console.log(
    `${chalk.magentaBright("Code")}${chalk.bold(chalk.magenta("Checks"))} ${chalk.yellow("Client")} ${chalk.dim(
      `v.${require("../package.json").version}`,
    )}`,
  );
  console.log(formatLink("https://codechecks.io"));
  console.log();
}

export function bold(input: string | number): string {
  return chalk.bold(input.toString());
}

export function red(input: string | number): string {
  return chalk.red(input.toString());
}

export function green(input: string | number): string {
  return chalk.green(input.toString());
}

export function formatSHA(sha: string): string {
  return sha.slice(0, 8);
}

export function formatPath(path: string, rootPath: string): string {
  return relative(rootPath, path);
}

export function formatLink(link: string): string {
  return chalk.underline(chalk.blueBright(link));
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

  critical(...args: any[]): void {
    console.error(chalk.red("Critical error occured: "), ...args);
    process.exit(1);
  }
}

export const logger = new Logger();

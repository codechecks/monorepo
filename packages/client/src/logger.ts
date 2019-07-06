// types for debug library suck so we dont use them
const debug = require("debug")("codechecks:client");
import chalk from "chalk";

export function printLogo(): void {
  console.log(
    `${chalk.magentaBright("code")}${chalk.bold(chalk.magenta("checks"))} Client ${chalk.dim(
      `v.${require("../package.json").version}`,
    )}`,
  );
  console.log();
}

class Logger {
  log(...args: any[]): void {
    console.log(...args);
  }

  debug(...args: any[]): void {
    debug(...args);
  }

  error(...args: any[]): void {
    console.error(...args);
  }
}

export const logger = new Logger();

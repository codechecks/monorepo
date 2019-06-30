// types for debug library suck so we dont use them
const debug = require("debug")("codechecks:client");

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

class CodeChecksCrashError extends Error {}

export function crash(message: string): never {
  throw new CodeChecksCrashError(message);
}

export function isCodeChecksCrash(error: CodeChecksCrashError): error is CodeChecksCrashError {
  return error instanceof CodeChecksCrashError;
}

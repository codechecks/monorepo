import { CodechecksClient } from "./client";

// try using global codechecks client, if it doesnt exist it will be injected later
export const codechecks: CodechecksClient = (global as any).__codechecks_client || {};

export * from "./types";

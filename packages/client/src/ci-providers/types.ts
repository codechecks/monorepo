import { Dictionary } from "ts-essentials";

type AsyncOrSync<T> = Promise<T> | T;

export type CiProvider = {
  name: string;
  isCurrentlyRunning(): AsyncOrSync<boolean>;
  getCurrentSha(): AsyncOrSync<string>;
  isFork(): AsyncOrSync<boolean>;
  getPullRequestID(): AsyncOrSync<number | undefined>;
  getProjectSlug(): AsyncOrSync<string>;
  supportsSpeculativeBranchSelection(): AsyncOrSync<boolean>;
};

export type Env = Dictionary<string | undefined>;

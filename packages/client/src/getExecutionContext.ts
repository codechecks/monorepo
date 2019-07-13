import { CiProvider } from "./ci-providers/types";
import { Api, PrInfo, ProjectInfo } from "./api";
import { DeepReadonly } from "ts-essentials";
import { Path } from "./utils";
import { dirname } from "path";
import { LocalProvider } from "./ci-providers/Local";
import { CodeChecksSettings } from "./types";
import { getPrInfoForSpeculativeBranch } from "./speculativeBranchSelection";

/**
 * Better part of execution context stays the same for all codechecks files being executed so we just get it once.
 */
export async function getConstExecutionContext(
  api: Api,
  ciProvider: CiProvider,
  settings: CodeChecksSettings,
  gitRepoRootPath: string,
): Promise<SharedExecutionContext> {
  const currentSha = await ciProvider.getCurrentSha();
  const isFork = await ciProvider.isFork();
  const pr = await ciProvider.getPullRequestID();
  const projectSlug = await ciProvider.getProjectSlug();
  if (!pr && isFork) {
    throw new Error("Provider should never be in fork mode and not in PR mode!");
  }

  let prInfo: PrInfo | undefined;
  let projectInfo: ProjectInfo;
  let localMode: SharedExecutionContext["isLocalMode"] | undefined;
  let isSpeculativePr: boolean = false;
  if (ciProvider instanceof LocalProvider) {
    let isOffline = false;
    try {
      projectInfo = await api.projectInfoPublic(projectSlug);
    } catch {
      isOffline = true;
      projectInfo = {
        projectSlug: "local/project",
        artifactsProxyUrl: "http://nowhere",
        artifactsProxySupportsPages: true,
        isPrivate: false,
      };
    }

    localMode = {
      projectSlug,
      isOffline,
    };
    prInfo = await ciProvider.getPrInfo();
  } else if (isFork) {
    projectInfo = await api.projectInfoPublic(projectSlug);
    if (pr !== undefined) {
      prInfo = await api.prInfoPublic(pr, projectSlug);
    }
  } else {
    projectInfo = await api.projectInfo();
    if (pr !== undefined || settings.speculativeBranchSelection) {
      if (pr) {
        prInfo = await api.prInfo(pr);
      } else if (ciProvider.supportsSpeculativeBranchSelection()) {
        prInfo = await getPrInfoForSpeculativeBranch(settings, gitRepoRootPath);
        if (prInfo) {
          isSpeculativePr = true;
        }
      }
    }
  }

  if (prInfo !== undefined) {
    return {
      isPr: true,
      isPrivate: projectInfo.isPrivate,
      projectSlug: projectInfo.projectSlug,
      artifactsProxy: {
        url: projectInfo.artifactsProxyUrl,
        supportsPages: projectInfo.artifactsProxySupportsPages,
      },
      currentSha,
      isLocalMode: localMode,
      pr: prInfo,
      isFork,
      isSpeculativePr,
    };
  } else {
    return {
      isPr: false,
      isPrivate: projectInfo.isPrivate,
      projectSlug: projectInfo.projectSlug,
      artifactsProxy: {
        url: projectInfo.artifactsProxyUrl,
        supportsPages: projectInfo.artifactsProxySupportsPages,
      },
      currentSha,
      isLocalMode: localMode,
      isFork,
      isSpeculativePr: false,
    };
  }
}

export function getExecutionContext(
  sharedExecutionCtx: SharedExecutionContext,
  codeChecksFilePath: Path,
): ExecutionContext {
  return {
    codeChecksFileAbsPath: codeChecksFilePath,
    workspaceRoot: dirname(codeChecksFilePath),
    ...sharedExecutionCtx,
  };
}

export type RefInfo = {
  sha: string;
};

export type ExecutionContext = DeepReadonly<
  {
    codeChecksFileAbsPath: string;
    workspaceRoot: string; // directory containing current CodeChecks file
  } & SharedExecutionContext
>;

/**
 * This stays the same across different codechecks files
 */
export interface SharedExecutionContext {
  projectSlug: string;
  artifactsProxy: {
    url: string;
    supportsPages: boolean;
  };
  isPrivate: boolean;
  currentSha: string;
  isPr: boolean;
  pr?: PrInfo;
  isLocalMode?: {
    projectSlug: string;
    isOffline: boolean;
  };
  isFork: boolean;
  isSpeculativePr: boolean;
}

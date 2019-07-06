export interface CodeChecksReportBody {
  name: string;
  // ~45 characters fits here
  // no markdown
  shortDescription: string;
  // markdown support
  longDescription?: string;
  detailsUrl?: string | { url: string; label: string };
}

export type CodeChecksReportStatus = "success" | "failure";

export interface CodeChecksReport extends CodeChecksReportBody {
  status: CodeChecksReportStatus;
}

export interface CodeChecksSettings {
  speculativeBranchSelection: boolean;
  branches: string[];
}

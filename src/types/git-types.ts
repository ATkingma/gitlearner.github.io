// Git types for better type safety across components
export interface GitCommit {
  oid: string;
  message: string;
  author: string;
  timestamp: number;
  branch: string;
  mergeFrom?: string; // For merge commits - which branch was merged
  mergeInto?: string; // For merge commits - which branch it was merged into
  branchedFrom?: string; // For branch commits - which branch this was created from
  parentCommit?: string; // The commit this was based on
}

export interface GitRepo {
  currentBranch: string;
  commits: GitCommit[];
  branches: string[];
  staged: string[];
}

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface ConsoleLog {
  message: string;
  type: 'input' | 'output' | 'error';
}

export interface VisualCommit extends GitCommit {
  x: number;
  y: number;
  color: string;
}

export interface BranchPath {
  d: string;
  color: string;
  type: 'branch' | 'merge' | 'branch-out';
}

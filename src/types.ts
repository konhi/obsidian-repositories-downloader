export interface Plugin {
  repo: string;
}

export interface DownloadResult {
  repo: string;
  error?: Error;
}

export interface RepoParts {
  owner: string;
  name: string;
}

export interface CliOptions {
  concurrent: number;
}

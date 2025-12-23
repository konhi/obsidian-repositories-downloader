import { DEFAULT_BRANCHES, REPOSITORIES_DIR } from "./config";
import { RepoParts } from "./types";
import {
  extractZip,
  cleanupZipFile,
  removeExistingDirectory,
  renameExtractedFolder,
} from "./filesystem";

export function parseRepo(repo: string): RepoParts {
  const parts = repo.split("/");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error(`Invalid repo format: ${repo}`);
  }
  return { owner: parts[0], name: parts[1] };
}

async function downloadArchive(
  owner: string,
  repoName: string,
  branch: string
): Promise<ArrayBuffer> {
  const url = `https://github.com/${owner}/${repoName}/archive/refs/heads/${branch}.zip`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${url}: ${response.status} ${response.statusText}`
    );
  }

  return response.arrayBuffer();
}

export async function downloadRepository(repo: string): Promise<void> {
  const { owner, name } = parseRepo(repo);

  for (const branch of DEFAULT_BRANCHES) {
    try {
      const archiveBuffer = await downloadArchive(owner, name, branch);
      const zipPath = `${REPOSITORIES_DIR}/${repo}.zip`;
      const extractedPath = `${REPOSITORIES_DIR}/${name}-${branch}`;
      const finalPath = `${REPOSITORIES_DIR}/${repo}`;

      await Bun.write(zipPath, archiveBuffer);
      await extractZip(zipPath, REPOSITORIES_DIR);
      await cleanupZipFile(zipPath);
      await removeExistingDirectory(finalPath);
      await renameExtractedFolder(extractedPath, finalPath);

      return;
    } catch (error) {
      const isLastBranch = branch === DEFAULT_BRANCHES[DEFAULT_BRANCHES.length - 1];
      if (isLastBranch) {
        throw error;
      }
      continue;
    }
  }
}

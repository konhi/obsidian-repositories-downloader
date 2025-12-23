import { REPOSITORIES_DIR } from "./config";

export async function extractZip(zipPath: string, outputDir: string): Promise<void> {
  const process = Bun.spawn(["unzip", "-q", "-o", zipPath, "-d", outputDir]);

  await process.exited;

  if (process.exitCode !== 0) {
    throw new Error(`Failed to extract archive: exit code ${process.exitCode}`);
  }
}

export async function cleanupZipFile(zipPath: string): Promise<void> {
  await Bun.spawn(["rm", zipPath]).exited;
}

export async function removeExistingDirectory(path: string): Promise<void> {
  await Bun.spawn(["rm", "-rf", path]).exited;
}

export async function renameExtractedFolder(
  extractedPath: string,
  finalPath: string
): Promise<void> {
  const process = Bun.spawn(["mv", extractedPath, finalPath]);
  await process.exited;

  if (process.exitCode !== 0) {
    throw new Error(
      `Failed to rename folder: exit code ${process.exitCode}`
    );
  }
}

export async function ensureRepositoriesDirectory(): Promise<void> {
  await Bun.spawn(["mkdir", "-p", REPOSITORIES_DIR]).exited;
}

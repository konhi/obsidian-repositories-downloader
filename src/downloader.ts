import { COMMUNITY_PLUGINS_URL } from "./config";
import { Plugin, DownloadResult } from "./types";
import { createProgressTracker } from "./progress";
import { downloadRepository } from "./repository";

async function downloadBatch(
  batch: string[],
  tracker: ReturnType<typeof createProgressTracker>
): Promise<DownloadResult[]> {
  return Promise.all(
    batch.map(async (repo) => {
      try {
        await downloadRepository(repo);
        await tracker.update(repo);
        return { repo };
      } catch (error) {
        await tracker.update(repo);
        return {
          repo,
          error: error instanceof Error ? error : new Error(String(error)),
        };
      }
    })
  );
}

export async function downloadRepositories(
  repos: string[],
  concurrentDownloads: number
): Promise<DownloadResult[]> {
  const tracker = createProgressTracker(repos.length);
  const results: DownloadResult[] = [];

  for (let i = 0; i < repos.length; i += concurrentDownloads) {
    const batch = repos.slice(i, i + concurrentDownloads);
    const batchResults = await downloadBatch(batch, tracker);
    results.push(...batchResults);
  }

  tracker.finish();
  return results;
}

export async function fetchPluginRepositories(): Promise<string[]> {
  process.stdout.write("Fetching community-plugins.json... ");

  const response = await fetch(COMMUNITY_PLUGINS_URL);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch plugins: ${response.status} ${response.statusText}`
    );
  }

  const plugins = (await response.json()) as Plugin[];
  const repos = plugins.map((plugin) => plugin.repo);

  console.log(`✅ Found ${repos.length} plugins!`);

  return repos;
}

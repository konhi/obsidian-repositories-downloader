import { parseCliArgs } from "./cli";
import { ensureRepositoriesDirectory } from "./filesystem";
import { fetchPluginRepositories, downloadRepositories } from "./downloader";

async function main(): Promise<void> {
  const options = parseCliArgs();

  await ensureRepositoriesDirectory();

  const repos = await fetchPluginRepositories();
  const results = await downloadRepositories(repos, options.concurrent);

  const failed = results.filter((result) => result.error !== undefined);

  if (failed.length > 0) {
    console.log("\n⚠️  Failed downloads:");
    for (const result of failed) {
      console.log(`  • ${result.repo}: ${result.error?.message ?? "Unknown error"}`);
    }
  }
}

await main();

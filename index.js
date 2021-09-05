// Used to fetch community-plugins.json, may be changed to something different in future, like "got".
import fetch from "node-fetch";
import { download, extract } from "gitly";
import cliProgress from "cli-progress";
import ora from "ora";

const URLS = {
  COMMUNITY_PLUGINS:
    "https://raw.githubusercontent.com/obsidianmd/obsidian-releases/master/community-plugins.json",
};

/** Download repository and fallback to other branch if it doesn't use `master`. */
async function downloadRepo(repo) {
  let source;

  // Fallback to main branch if master doesn't work. The default in `gitly` is `master` and most Obsidian repositories use it.
  try {
    // Try to download from `master` branch.
    source = await download(repo, { throw: true });
  } catch (error) {
    // If not found, try to download from main brach. Else it's an other error.
    if (error.code === 404) {
      source = await download(`${repo}#main`, { throw: true });
    } else {
      console.error(error);
    }
  }

  await extract(source, `repositories/${repo}`);
}

/** Downloads GitHub repositories that aren't already downloaded, creating a tree structure. */
async function downloadRepositories(repos) {
  const downloadBar = new cliProgress.SingleBar({
    format: "[{bar}] {percentage}% | {value}/{total} | 📂 {repo}",
    hideCursor: true,
  }, cliProgress.Presets.shades_classic);

  downloadBar.start(repos.length, 0);

  for (const repo of repos) {
    await downloadRepo(repo).then(downloadBar.increment({ repo: repo }));
  }

  downloadBar.stop();
}

/** Return list of plugin repositories on GitHub. */
async function getPluginsRepos() {
  const spinner = ora("Fetching community-plugins.json").start();

  // Fetch community-plugins.json and turn it into object
  const communityPluginsJson = await fetch(URLS.COMMUNITY_PLUGINS).then(
    (response) => response.json()
  );

  // Get "repo" from every plugin.
  const pluginsRepos = communityPluginsJson.map((plugin) => plugin.repo);

  spinner.succeed(`Found ${pluginsRepos.length} plugins!`);

  // [author/pluginname, author2/pluginname3...]
  return pluginsRepos;
}

getPluginsRepos().then((repos) => downloadRepositories(repos));

import { existsSync } from "fs";
// Used to fetch community-plugins.json, may be changed to something different in future, like "got".
import fetch from "node-fetch";
// Used to download git repositories. It's fast and simple, but you can't really do nice logging and UI with it. May be changed.
import download from "download-git-repo";
// Elegant terminal spinner.
import ora from "ora";

const URLS = {
  COMMUNITY_PLUGINS:
    "https://raw.githubusercontent.com/obsidianmd/obsidian-releases/master/community-plugins.json",
};

const spinner = ora("").start();

/** Downloads GitHub repositories that aren't already downloaded, creating a tree structure. */
function downloadRepositories(repos) {
  const spinner = ora(
    "Downloading repositories. This may take a while..."
  ).start();

  for (const repo of repos) {
    // It creates a tree structure, like repositories/author/plugin-name
    const downloadDestination = `repositories/${repo}`;

    // If repository is already downloaded, skip current iteration. It may be changed when user wants to update.
    if (existsSync(downloadDestination)) {
      continue;
    }

    // Tries to download from master branch and if gets error, does that from main branch. Using "branch" from community-plugins.json doesn't always work as it's user provided.
    download(`${repo}#master`, downloadDestination, function (err) {
      if (err) {
        download(`${repo}#main`, downloadDestination, function (err) {
          if (err) {
            console.error(err);
          }
        });
      }
    });
  }
}
/** Return list of plugin repositories on GitHub. */
async function getPluginsRepos() {
  const spinner = ora("Fetching community-plugins.json").start();

  // Fetch community-plugins.json and turn it object
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

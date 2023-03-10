// Used to fetch community-plugins.json, may be changed to something different in future, like "got".
import fetch from "node-fetch";
import { download, extract } from "gitly";
import cliProgress from "cli-progress";
import ora from "ora";
import * as fs_ from "fs";
import fs from "fs/promises";
import path from "path";
import remoteGitTags  from 'remote-git-tags';
import semver from 'semver';
// var gitSemverTags = require('git-semver-tags');

// URL to the `community-plugins.json` which contains infos about plugins and their GitHub repositories.
const URLS = {
  COMMUNITY_PLUGINS:
    "https://raw.githubusercontent.com/obsidianmd/obsidian-releases/master/community-plugins.json",
};
let updated = ""

// Download GitHub repo using the `gitly` package and fallback to other branch if it doesn't use `master`.
// The downloaded repository is extracted to the `repositories` folder.
async function downloadRepo(repo) {

  let update = " latest already";
  let source;
  const repoDir = `./repositories/${repo}`;
  const manifestPath = path.join(repoDir, "manifest.json");
  const dirExists = fs_.existsSync(repoDir)
  if (dirExists) {
    const manifest = JSON.parse(await fs.readFile(manifestPath, "utf-8"));
    const currentVersion = manifest.version;
    await download(repo, { throw: true });

    const remoteTags = await remoteGitTags("https://github.com/"+repo)
    const latest = [...remoteTags.keys()].map(tag => semver.coerce(tag)).sort(semver.rcompare)[0].version//coerce 1.0 to 1.0.0
    if (currentVersion !== latest) {
      update = ` ${repo},`
      updated+= update
    }
  }
  if (!dirExists || dirExists && update !== " latest already") {
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
  // return update // pour debug
}

/** Downloads GitHub repositories that aren't already downloaded, creating a tree structure. */
async function downloadRepositories(repos) {
  const downloadBar = new cliProgress.SingleBar(
    {
      format: "[{bar}] {percentage}% | {value}/{total} | 📂 {repo}",
      hideCursor: true,
    },
    cliProgress.Presets.shades_classic
  );

  downloadBar.start(repos.length, 0);
  // for (const repo of repos.slice(0,20)) { // for debug 
  for (const repo of repos) {
    await downloadRepo(repo)
      .then(downloadBar.increment({ repo: repo }))
      // .then((res) => console.log(res)); // for debug   
  }

  downloadBar.stop();
  if (updated) {console.log("Updated: "+ updated)}
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

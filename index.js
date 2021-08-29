const fetch = require("node-fetch");
const download = require("download-git-repo");
const fs = require("fs");

const COMMUNITY_PLUGINS_URL = 'https://raw.githubusercontent.com/obsidianmd/obsidian-releases/master/community-plugins.json'

async function fetchJSON(url) {
    return fetch(url)
        .then((response) => response.json());
}

async function downloadRepo(repo, branch = 'master') {
    const repoDestination = `downloads/${repo}`;

    console.log('')
    console.log(`--- ${repo} ---`)

    if (!fs.existsSync(repoDestination)) {
        download(`${repo}#${branch}`, repoDestination, function (err) {
            if (err) {
                console.log(`⌛ Caught error: ${err}. Trying to download from main branch...`)
                try {
                    downloadRepo(repo, 'main');
                    console.log(`⭐ Hurray! Repository downloaded from main branch.`)
                } catch (error) {
                    console.log(`❌ Couldn't download repo!`)
                }
            }
        })
        console.log('✅ Repository downloaded.')
    } else {
        console.log('🔄 Repository is already downloaded, skipping...')
    }
}

fetchJSON(COMMUNITY_PLUGINS_URL)
    .then(plugins => plugins.map(plugin => {
        console.log('✅ Fetched community-plugins.json')
        downloadRepo(plugin.repo)
        console.log('')
        console.log('✅ All repository got downloaded.')
    }))
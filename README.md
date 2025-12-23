<div align='center'>
    <h1>📩 Obsidian Repositories Downloader</h1>
  <img src="https://user-images.githubusercontent.com/61631665/132124154-58db4b3d-e19f-4f71-844c-5aefc0917b15.gif"/>
  <p>Learn, analyze and inspire from every <a href="https://obsidian.md">obsidian.md</a> plugin! Downloads every available Obsidian plugin.</p>

<hr/>      
<img src="https://user-images.githubusercontent.com/61631665/131258921-9960bad9-4b76-434e-9b30-cd9cf14cb683.png"/>
🔎 This allows to easily search and analyze other plugins. It's especially useful as Obsidian API isn't yet documented and GitHub search doesn't work as expected.

<hr/>  

<img src="https://user-images.githubusercontent.com/61631665/131258790-2499b1d7-50fe-4b9a-abde-0f00d6d08b17.png"/>
🌳 Generates a nice tree structure!

</div>

## 🔨 Other Tools
- [Everything](https://www.voidtools.com/): advanced search
- [obsidian-plugin-downloader](https://github.com/luckman212/obsidian-plugin-downloader): similiar tool written in Shell

## 👾 Usage

### Installation
```bash
git clone https://github.com/konhi/obsidian-repositories-downloader.git
cd obsidian-repositories-downloader
bun install
```

### Running
```bash
# Use default settings (20 concurrent downloads)
bun run src/index.ts

# Configure concurrent downloads
bun run src/index.ts --concurrent 10
bun run src/index.ts -c 5

# Show help
bun run src/index.ts --help
```

### Options
- `--concurrent, -c <number>` - Number of concurrent downloads (default: 20)
- `--help, -h` - Show help message

**Requirements:** [Bun](https://bun.sh) runtime

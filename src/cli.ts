import type { CliOptions } from "./types";

export function parseCliArgs(): CliOptions {
  const args = process.argv.slice(2);
  const options: CliOptions = {
    concurrent: 20,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    if (arg === "--help" || arg === "-h") {
      console.log(`
Usage: bun run src/index.ts [options]

Options:
  --concurrent, -c <number>  Number of concurrent downloads (default: 20)
  --help, -h                 Show this help message

Examples:
  bun run src/index.ts --concurrent 10
  bun run src/index.ts -c 5
`);
      process.exit(0);
    }

    if (arg === "--concurrent" || arg === "-c") {
      if (nextArg === undefined) {
        console.error("Error: --concurrent requires a number value");
        process.exit(1);
      }
      const parsed = parseInt(nextArg, 10);
      if (isNaN(parsed) || parsed < 1) {
        console.error("Error: --concurrent must be a positive number");
        process.exit(1);
      }
      options.concurrent = parsed;
      i++;
    }
  }

  return options;
}

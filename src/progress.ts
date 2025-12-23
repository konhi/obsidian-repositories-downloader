async function waitForLock(lock: { locked: boolean }): Promise<void> {
  while (lock.locked) {
    await new Promise((resolve) => setTimeout(resolve, 1));
  }
}

export function createProgressTracker(total: number) {
  const startTime = Date.now();
  let completed = 0;
  const lock = { locked: false };

  async function update(repo: string): Promise<void> {
    await waitForLock(lock);
    lock.locked = true;
    completed++;
    const percentage = Math.round((completed / total) * 100);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const filled = Math.floor(percentage / 2);
    const empty = 50 - filled;

    process.stdout.write(
      `\r[${"█".repeat(filled)}${"░".repeat(empty)}] ${percentage}% | ${completed}/${total} | 📂 ${repo}`
    );
    lock.locked = false;
  }

  function finish(): void {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n✅ Completed in ${elapsed}s`);
  }

  return { update, finish };
}

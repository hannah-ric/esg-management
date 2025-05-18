export async function measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const timerLabel = `perf:${label}`;
  console.time(timerLabel);
  try {
    return await fn();
  } finally {
    console.timeEnd(timerLabel);
  }
}

export interface PoolFailure<T> {
  item: T;
  error: unknown;
}

export interface PoolResult<T, R> {
  values: Array<R | undefined>;
  failures: Array<PoolFailure<T>>;
}

export async function runWorkerPool<T, R>(
  items: T[],
  concurrency: number,
  execute: (item: T) => Promise<R>,
): Promise<PoolResult<T, R>> {
  const values: Array<R | undefined> = Array.from({ length: items.length });
  const failures: Array<PoolFailure<T>> = [];
  let cursor = 0;

  async function runNext(): Promise<void> {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      const item = items[index]!;

      try {
        values[index] = await execute(item);
      } catch (error) {
        failures.push({ item, error });
      }
    }
  }

  const runners = Array.from({ length: Math.min(concurrency, items.length) }, () =>
    runNext(),
  );
  await Promise.all(runners);

  return { values, failures };
}

const running = new Map<string, Promise<unknown>>();

export function singleFlight<T>(key: string, task: () => Promise<T>): Promise<T> {
  const existing = running.get(key) as Promise<T> | undefined;
  if (existing) return existing;
  const promise = task().finally(() => running.delete(key));
  running.set(key, promise);
  return promise;
}

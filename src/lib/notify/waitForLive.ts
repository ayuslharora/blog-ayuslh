export type WaitOptions = {
  intervalMs: number;
  timeoutMs: number;
  fetchImpl?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
  now?: () => number;
  log?: (msg: string) => void;
};

export async function waitForLive(urls: string[], opts: WaitOptions): Promise<boolean> {
  const fetchImpl = opts.fetchImpl ?? fetch;
  const sleep = opts.sleep ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));
  const now = opts.now ?? Date.now;
  const log = opts.log ?? (() => {});
  const deadline = now() + opts.timeoutMs;

  let pending = [...urls];
  while (true) {
    const live = await Promise.all(
      pending.map(async (url) => {
        try {
          return (await fetchImpl(url, { cache: 'no-store' })).status === 200;
        } catch {
          return false;
        }
      })
    );
    pending = pending.filter((_, i) => !live[i]);
    if (pending.length === 0) return true;
    if (now() >= deadline) {
      log(`Still not live: ${pending.join(', ')}`);
      return false;
    }
    log(`Waiting for ${pending.length} post(s) to go live...`);
    await sleep(opts.intervalMs);
  }
}

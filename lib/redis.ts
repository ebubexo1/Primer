import Redis from 'ioredis';
const g = globalThis as any;
const r: Redis | null = g.__redis ||= process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: 1, enableOfflineQueue: false, lazyConnect: false })
  : null;
r?.on('error', () => {});

// Cache-aside: Redis is a side cache for the backend (it cannot sit transparently in front of Postgres). Fails open.
export async function cached<T>(key: string, ttl: number, fn: () => Promise<T>): Promise<T> {
  try { const h = await r?.get(key); if (h) return JSON.parse(h); } catch {}
  const v = await fn();
  try { await r?.set(key, JSON.stringify(v), 'EX', ttl); } catch {}
  return v;
}
export async function rateLimit(key: string, max: number, windowSec: number): Promise<boolean> {
  try { const n = await r!.incr(key); if (n === 1) await r!.expire(key, windowSec); return n <= max; } catch { return true; }
}

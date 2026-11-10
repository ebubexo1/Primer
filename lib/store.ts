import type { Prob } from './engine';
// Everything lives on the device until a sync succeeds.
const get = <T,>(k: string, d: T): T => { try { return JSON.parse(localStorage.getItem(k) || '') as T; } catch { return d; } };
const set = (k: string, v: any) => localStorage.setItem(k, JSON.stringify(v));
export const store = {
  anonId(): string { let id = localStorage.getItem('primer.anon'); if (!id) { id = crypto.randomUUID(); localStorage.setItem('primer.anon', id); } return id; },
  problems: () => get<Prob[]>('primer.problems', []),
  addProblems(ps: Prob[]) { const cur = store.problems(); const have = new Set(cur.map((p) => p.id)); set('primer.problems', [...cur, ...ps.filter((p) => !have.has(p.id))]); },
  scanned: () => get<Record<string, number>>('primer.scanned', {}),
  markScanned(key: string, total: number) { const s = store.scanned(); s[key] = total; set('primer.scanned', s); },
  idx: () => get<number>('primer.idx', 0),
  setIdx: (i: number) => set('primer.idx', i),
  log: () => get<any[]>('primer.log', []),
  push(e: any) { const l = store.log(); l.push(e); set('primer.log', l); },
  cursor: () => get<number>('primer.cursor', 0),
  setCursor: (c: number) => set('primer.cursor', c),
  recs: () => get<any[]>('primer.recs', []),
  setRecs: (r: any[]) => set('primer.recs', r),
};
export async function sync(): Promise<{ ok: boolean; synced?: number }> {
  const log = store.log(); const cur = store.cursor();
  if (log.length === cur) return { ok: true, synced: 0 };
  try {
    const r = await fetch('/api/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ anonId: store.anonId(), events: log.slice(cur) }) });
    if (!r.ok) return { ok: false };
    const d = await r.json(); store.setCursor(log.length); store.setRecs(d.recs || []); return { ok: true, synced: d.synced };
  } catch { return { ok: false }; }
}

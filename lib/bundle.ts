import pako from 'pako';
import type { Prob } from './engine';
// QR payload:  PRM1|<assignId>|<chunk>|<total>|<base64(deflate(json [[a,b,c],...]))>
// Every code is self-contained: scan order is irrelevant and a lost code only loses its own problems.
const MAX = 1200;
const enc = (p: number[][]) => btoa(String.fromCharCode(...pako.deflate(JSON.stringify(p))));

export function pack(assign: string, probs: number[][]): string[] {
  const chunks: number[][][] = []; let cur: number[][] = [];
  for (const p of probs) {
    if (cur.length && enc([...cur, p]).length > MAX) { chunks.push(cur); cur = []; }
    cur.push(p);
  }
  if (cur.length) chunks.push(cur);
  return chunks.map((c, i) => `PRM1|${assign}|${i}|${chunks.length}|${enc(c)}`);
}
export function unpack(text: string): { assign: string; i: number; n: number; problems: Prob[] } | null {
  const [tag, assign, i, n, body] = text.split('|');
  if (tag !== 'PRM1' || !body) return null;
  try {
    const bin = atob(body); const bytes = Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
    const rows: number[][] = JSON.parse(pako.inflate(bytes, { to: 'string' }));
    return { assign, i: +i, n: +n, problems: rows.map(([a, b, c], j) => ({ id: `${assign}:${i}:${j}`, a, b, c })) };
  } catch { return null; }
}

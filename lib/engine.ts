// Algebra world: state is a x + b = c. The next options are generated FROM the current state.
export type Prob = { id: string; a: number; b: number; c: number };
export type State = { a: number; b: number; c: number; done: boolean };
export type Opt = { id: string; label: string; correct: boolean; misc?: string; next?: State };
const n = (v: number) => String(Math.round(v * 1000) / 1000);
const st = (a: number, b: number, c: number): State => ({ a, b, c, done: a === 1 && b === 0 });
export const start = (p: Prob): State => st(p.a, p.b, p.c);

export function show(s: State) {
  if (s.done) return `x = ${n(s.c)}`;
  const co = s.a === 1 ? '' : s.a === -1 ? '-' : n(s.a);
  const k = s.b === 0 ? '' : s.b > 0 ? ` + ${n(s.b)}` : ` - ${n(-s.b)}`;
  return `${co}x${k} = ${n(s.c)}`;
}
const op = (v: number, both = 'both sides') => (v > 0 ? `Subtract ${n(v)} from ${both}` : `Add ${n(-v)} to ${both}`);
const inv = (v: number, both = 'both sides') => (v > 0 ? `Add ${n(v)} to ${both}` : `Subtract ${n(-v)} from ${both}`);

export function options(s: State): Opt[] {
  const o: Opt[] = [];
  if (s.b !== 0) {
    o.push({ id: 'rm-b', label: op(s.b), correct: true, next: st(s.a, 0, s.c - s.b) });
    o.push({ id: 'inv-b', label: inv(s.b), correct: false, misc: 'wrong-inverse' });
    o.push({ id: 'one-b', label: op(s.b, 'the left side only'), correct: false, misc: 'one-side' });
    if (s.a !== 1) o.push({ id: 'div-first', label: `Divide both sides by ${n(s.a)}`, correct: true, next: st(1, s.b / s.a, s.c / s.a) });
  } else if (s.a !== 1) {
    o.push({ id: 'div-a', label: `Divide both sides by ${n(s.a)}`, correct: true, next: st(1, 0, s.c / s.a) });
    o.push({ id: 'mul-a', label: `Multiply both sides by ${n(s.a)}`, correct: false, misc: 'wrong-inverse' });
    o.push({ id: 'sub-a', label: `Subtract ${n(s.a)} from both sides`, correct: false, misc: 'sub-coefficient' });
    o.push({ id: 'one-a', label: `Divide the left side by ${n(s.a)} only`, correct: false, misc: 'one-side' });
  }
  return o;
}
export function shuffle<T>(a: T[]): T[] { return [...a].sort(() => Math.random() - 0.5); }

// ~60% multi-step (has a constant), ~40% single-step. Problems are [a,b,c] templates, so they pack tightly into QR codes.
export function generate(count: number): [number, number, number][] {
  return Array.from({ length: count }, () => {
    const a = 2 + Math.floor(Math.random() * 8);
    const x = Math.floor(Math.random() * 19) - 9 || 4;
    const b = Math.random() < 0.6 ? (Math.floor(Math.random() * 17) - 8 || 3) : 0;
    return [a, b, a * x + b] as [number, number, number];
  });
}

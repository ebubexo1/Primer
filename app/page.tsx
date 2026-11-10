'use client';
import { useEffect, useMemo, useState } from 'react';
import { start, show, options, shuffle, generate, type Prob, type State } from '@/lib/engine';
import { store, sync } from '@/lib/store';

export default function Feed() {
  const [ready, setReady] = useState(false);
  const [probs, setProbs] = useState<Prob[]>([]);
  const [idx, setIdx] = useState(0);
  const [state, setState] = useState<State | null>(null);
  const [hist, setHist] = useState<string[]>([]);
  const [step, setStep] = useState(0);
  const [wrong, setWrong] = useState(0);        // wrong taps on this step
  const [firstTry, setFirstTry] = useState(0);  // steps solved first try (score)
  const [total, setTotal] = useState(0);
  const [shake, setShake] = useState('');
  const [net, setNet] = useState('');
  const [recs, setRecs] = useState<any[]>([]);

  const load = (i: number, ps = probs) => { const p = ps[i]; if (p) { setState(start(p)); setHist([]); setStep(0); setWrong(0); } else setState(null); };
  useEffect(() => { const ps = store.problems(); const i = store.idx(); setProbs(ps); setIdx(i); setRecs(store.recs()); setReady(true); load(i, ps);
    const on = () => doSync(); window.addEventListener('online', on); return () => window.removeEventListener('online', on); }, []);

  const opts = useMemo(() => (state && !state.done ? shuffle(options(state)) : []), [state?.a, state?.b, state?.c, idx]);
  const doSync = async () => { const r = await sync(); setNet(r.ok ? `Synced ${r.synced ?? 0} steps` : 'Offline: will sync later'); setRecs(store.recs()); };

  const pick = (o: any) => {
    const p = probs[idx];
    store.push({ cid: crypto.randomUUID(), pid: p.id, step, optionId: o.id, misc: o.misc, correct: o.correct, ts: Date.now() });
    if (!o.correct) { navigator.vibrate?.(200); setShake(o.id); setWrong((w) => w + 1); setTimeout(() => setShake(''), 350); return; }
    setHist((h) => [...h, show(state!)]); setTotal((t) => t + 1); if (wrong === 0) setFirstTry((f) => f + 1);
    setState(o.next); setStep((s) => s + 1); setWrong(0);
  };
  const next = () => { const i = idx + 1; store.setIdx(i); setIdx(i); load(i); doSync(); };
  const demo = () => { const ps = generate(20).map(([a, b, c], j) => ({ id: `demo:0:${j}`, a, b, c })); store.addProblems(ps); const all = store.problems(); setProbs(all); load(idx, all); };

  if (!ready) return null;
  if (!probs[idx]) return (<><h1 className="title">Solve</h1>
    <div className="panel"><h2>No problems on this phone</h2>
    <p className="mut">Scan a teacher's QR sheet while online or offline.</p>
    <a className="btn primary" href="/scan">Scan QR codes</a><button onClick={demo}>Load 20 demo problems</button></div></>);

  return (<><h1 className="title">Solve</h1>
    <div className="panel paper">
      <div className="progress" role="progressbar" aria-label={`Problem ${idx + 1} of ${probs.length}`}>
        <i style={{ width: `${((idx + 1) / probs.length) * 100}%` }} /></div>
      <div className="mut">Problem {idx + 1} of {probs.length} · first-try {firstTry}/{total}</div>
      {hist.map((h, i) => <div key={i} className="hist">{h}</div>)}
      <div className="eq">{state ? show(state) : ''}</div></div>
    {state?.done ? (<div className="panel"><b>Solved.</b><button className="primary" onClick={next}>Next problem</button></div>) : (
      <div><div className="mut">Choose the next step{wrong >= 2 ? ' (hint highlighted)' : ''}</div>
        {opts.map((o) => <button key={o.id} className={`${shake === o.id ? 'bad' : ''} ${wrong >= 2 && o.correct ? 'hint' : ''}`} onClick={() => pick(o)}>{o.label}</button>)}</div>)}
    {recs.length > 0 && <div className="panel"><b>Recommended Deck cards</b>{recs.map((r) => <a key={r.id} className="btn link" href={`/decks?card=${r.id}`}>{r.title}</a>)}</div>}
    <p className="mut">{net} <a href="#" onClick={(e) => { e.preventDefault(); doSync(); }}>Sync now</a></p>
  </>);
}

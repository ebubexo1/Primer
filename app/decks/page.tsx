'use client';
import { useEffect, useRef, useState } from 'react';

type Frame = { id: string; pos: number };   // return stack entry: where to come back to
export default function Decks() {
  const [decks, setDecks] = useState<any[] | null>(null);
  const [data, setData] = useState<any>(null);
  const [stack, setStack] = useState<Frame[]>([]);
  const [cur, setCur] = useState(0);           // seconds if the card has audio, else transcript characters
  const [speaking, setSpeaking] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);
  const startAt = useRef(0);

  const open = async (id: string, pos = 0) => {
    speechSynthesis.cancel(); setSpeaking(false);
    const r = await fetch(`/api/cards/${id}`); if (!r.ok) return;
    startAt.current = pos; setCur(pos); setData(await r.json());
  };
  useEffect(() => {
    fetch('/api/decks').then((r) => r.json()).then(setDecks).catch(() => setDecks([]));
    const c = new URLSearchParams(location.search).get('card'); if (c) open(c);
  }, []);

  const card = data?.card;
  const speak = (from = cur) => {                      // offline voice: the phone reads the transcript aloud
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(card.transcript.slice(from));
    u.onboundary = (e) => setCur(from + e.charIndex);
    u.onend = () => setSpeaking(false);
    setSpeaking(true); speechSynthesis.speak(u);
  };
  const follow = (l: any) => { setStack((s) => [...s, { id: card.id, pos: cur }]); open(l.to_card, l.to_start); };
  const back = () => { const s = [...stack]; const f = s.pop(); if (!f) return; setStack(s); open(f.id, f.pos); };   // resume exactly where you stopped
  const visible = (data?.links || []).filter((l: any) => cur >= l.from_start && cur <= l.from_end);

  if (!card) return (<><h1 className="title">Decks</h1><div className="panel">
    {decks === null ? [0, 1, 2].map((i) => <div key={i} className="skeleton" style={{ width: `${68 - i * 14}%`, opacity: 1 - i * .25 }} />)
      : decks.map((d) => (<div key={d.id}><b>{d.title}</b>
    {d.cards.map((c: any) => <button key={c.id} onClick={() => open(c.id)}>{c.title}</button>)}</div>))}
    {decks !== null && !decks.length && <p className="mut">Connect once to load Decks.</p>}</div></>);

  return (<div className="panel">
    {stack.length > 0 && <button onClick={back}>Back to where you stopped</button>}
    <h2>{card.title}</h2>
    {card.image_url && <img src={card.image_url} style={{ width: '100%', borderRadius: 12 }} alt="" />}
    {card.audio_url
      ? <audio ref={audio} src={card.audio_url} controls style={{ width: '100%' }} onLoadedMetadata={() => { if (audio.current) audio.current.currentTime = startAt.current; }}
          onTimeUpdate={(e) => setCur(Math.floor((e.target as HTMLAudioElement).currentTime))} />
      : <button className="primary" onClick={() => (speaking ? (speechSynthesis.cancel(), setSpeaking(false)) : speak())}>{speaking ? 'Stop' : cur > 0 ? 'Resume voice' : 'Play voice (offline speech)'}</button>}
    <p>{card.audio_url ? card.transcript : (<><span className="mut">{card.transcript.slice(0, cur)}</span>{card.transcript.slice(cur)}</>)}</p>
    {visible.map((l: any) => <button key={l.id} className="link" onClick={() => follow(l)}>{l.label || l.to_title}{l.stale ? ' (target changed)' : ''}</button>)}
    {data.backlinks.length > 0 && <><div className="mut">Linked from</div>{data.backlinks.map((b: any) => <button key={b.id} onClick={() => open(b.id)}>{b.title}</button>)}</>}
    <button onClick={() => { setData(null); setStack([]); speechSynthesis.cancel(); }}>All decks</button></div>);
}

import QRCode from 'qrcode';
import type { CSSProperties } from 'react';
import OpenBar from './openbar';

// Headline is split so each word can rise in separately; the last four words
// get the highlighter sweep (see .hero h1 in globals.css).
const HERO = 'The whole lesson fits in a piece of paper.'.split(' ');

export const metadata = { title: 'Primer — the whole lesson fits in a piece of paper' };
// Every artifact on this page is a real product artifact: a real scannable Primer code,
// the real paper equation card, the real deck card. Nothing is stock illustration.
export default async function Welcome() {
  const qr = await QRCode.toDataURL('https://github.com/ebubexo1/Primer',
    { errorCorrectionLevel: 'M', margin: 1, width: 300, color: { dark: '#1c2624', light: '#fffefb' } });

  return (<div className="welcome">
    <header className="w-nav noprint">
      <b className="wordmark"><img src="/owl.svg" alt="" width={34} height={34} />Primer</b>
      <a className="btn primary" href="/app">Open Primer</a>
    </header>

    <section className="hero">
      <h1 aria-label="The whole lesson fits in a piece of paper.">
        {HERO.map((w, i) => (
          <span key={i} aria-hidden="true" className={i >= HERO.length - 4 ? 'hl' : ''} style={{ '--i': i } as CSSProperties}>{w}</span>
        ))}
      </h1>
      <p className="lede">Print a sheet. Students scan it. They learn all week — even when the internet isn't there.</p>
      <div className="cta-row"><a className="btn primary" href="/app">Open Primer</a><a className="btn link" href="#how">How it works</a></div>
      <div className="hero-art" aria-hidden="true">
        <div className="sheet"><img src={qr} alt="" width={150} height={150} /><span className="mut">Assignment A1F3 · 20 problems</span></div>
        <div className="mascot"><img src="/owl.svg" alt="" width={64} height={64} /></div>
        <div className="phonecard"><div className="panel paper"><div className="eq">3x + 2 = 11</div></div></div>
      </div>
    </section>

    <section id="how" className="steps">
      <div className="step"><span>01</span><h2>Print</h2><p><b>Paper is the lesson plan.</b> A sheet of QR codes, twenty problems, no student accounts.</p></div>
      <div className="step"><span>02</span><h2>Scan</h2><p><b>One look and it's theirs.</b> The phone reads each code once and the lesson now lives on the phone.</p></div>
      <div className="step"><span>03</span><h2>Solve</h2><p><b>No internet. Ever.</b> Airplane mode, dead zone, data finished — the work keeps going.</p></div>
    </section>

    <section className="tutor">
      <div className="t-demo panel paper">
        <div className="eq">3x + 2 = 11</div>
        <button disabled>Subtract 2 from the left side only</button>
        <button disabled className="hint">Divide both sides by 3</button>
      </div>
      <div className="t-copy"><h2>Every mistake becomes a lesson.</h2>
        <p>Pick a wrong step and the app teaches the idea behind it — as a short card, not a red X.</p></div>
    </section>

    <section className="voice">
      <div className="t-copy"><h2>It reads out loud.</h2>
        <p>The same transcript plays as speech, on the cheapest phone in the room. No SIM, no stream.</p></div>
      <div className="t-demo panel">
        <b>The 1929 crash and 1933</b>
        <p className="mut">"Hyperinflation in 1923 had wiped out savings. Then the 1929 crash ended foreign loans…"</p>
        <a className="btn primary" href="/decks?card=weimar-crash">Play this card</a>
      </div>
    </section>

    <section className="teachers">
      <h2>Your printer is a classroom.</h2>
      <div className="stats">
        <div><b>100+</b><span className="mut">problems from one click</span></div>
        <div><b>1</b><span className="mut">QR code is self-contained — lost one, lose nothing</span></div>
        <div><b>0</b><span className="mut">student logins, apps, or bars of signal</span></div>
      </div>
      <p className="lede">Keep the lesson plan in paper. Primer keeps the learning in their pocket.</p>
      <a className="btn primary" href="/teacher">Print your first sheet</a>
    </section>

    <section className="close">
      <h2>No accounts. No tracking. Just work.</h2>
      <p className="lede">Open Primer. One tap, and the class starts.</p>
      <a className="btn primary" href="/app">Open Primer</a>
    </section>

    <footer className="noprint">
      <a href="/welcome">Primer</a><a href="https://github.com/ebubexo1/Primer">GitHub</a><a href="/app">Back to the app</a>
      <OpenBar />
    </footer>
  </div>);
}

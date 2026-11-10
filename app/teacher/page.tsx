'use client';
import { useState } from 'react';
import QRCode from 'qrcode';
import { generate } from '@/lib/engine';
import { pack } from '@/lib/bundle';

export default function Teacher() {
  const [count, setCount] = useState(100);
  const [imgs, setImgs] = useState<string[]>([]);
  const [assign, setAssign] = useState('');
  const make = async () => {
    const id = Math.random().toString(36).slice(2, 8);
    const payloads = pack(id, generate(count));   // TODO: swap generate() for AI-written, teacher-reviewed problem trees
    setImgs(await Promise.all(payloads.map((p) => QRCode.toDataURL(p, { errorCorrectionLevel: 'M', margin: 1, width: 360 }))));
    setAssign(id);
  };
  return (<>
    <h1 className="title">Print a sheet</h1>
    <div className="panel noprint">
      <label>Problems <input type="number" min={10} max={400} value={count} onChange={(e) => setCount(+e.target.value)} /></label>
      <button className="primary" onClick={make}>Generate</button>
      {imgs.length > 0 && <><p className="mut">Assignment {assign}: {imgs.length} codes. Each is self-contained.</p><button className="primary" onClick={() => window.print()}>Print</button></>}</div>
    <div className="qr">{imgs.map((s, i) => <div key={i}><img src={s} alt={`code ${i + 1}`} /><div className="mut">{assign} #{i + 1}/{imgs.length}</div></div>)}</div>
  </>);
}

'use client';
import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { unpack } from '@/lib/bundle';
import { store } from '@/lib/store';

export default function Scan() {
  const v = useRef<HTMLVideoElement>(null);
  const [msg, setMsg] = useState('Point the camera at a code');
  const [paste, setPaste] = useState('');
  const [count, setCount] = useState(0);

  const ingest = (text: string) => {
    const u = unpack(text); if (!u) return false;
    const key = `${u.assign}:${u.i}`;
    if (store.scanned()[key]) return true;                      // already have this code
    store.addProblems(u.problems); store.markScanned(key, u.n);
    const got = Object.keys(store.scanned()).filter((k) => k.startsWith(u.assign + ':')).length;
    setCount(store.problems().length); setMsg(`Assignment ${u.assign}: ${got}/${u.n} codes scanned`);
    navigator.vibrate?.(60); return true;
  };

  useEffect(() => {
    setCount(store.problems().length);
    let stop = false; let stream: MediaStream;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        v.current!.srcObject = stream; await v.current!.play();
        const det = 'BarcodeDetector' in window ? new (window as any).BarcodeDetector({ formats: ['qr_code'] }) : null;  // Safari: jsQR fallback
        const cv = document.createElement('canvas'); const cx = cv.getContext('2d', { willReadFrequently: true })!;
        const loop = async () => {
          if (stop) return; const el = v.current!;
          if (el.videoWidth) {
            try {
              if (det) { const r = await det.detect(el); r.forEach((b: any) => ingest(b.rawValue)); }
              else { cv.width = el.videoWidth; cv.height = el.videoHeight; cx.drawImage(el, 0, 0);
                const d = cx.getImageData(0, 0, cv.width, cv.height); const q = jsQR(d.data, d.width, d.height); if (q) ingest(q.data); }
            } catch {}
          }
          setTimeout(loop, 250);
        };
        loop();
      } catch { setMsg('Camera unavailable: paste the code text below instead'); }
    })();
    return () => { stop = true; stream?.getTracks().forEach((t) => t.stop()); };
  }, []);

  return (<><h1 className="title">Scan</h1>
    <div className="panel noprint"><video ref={v} playsInline muted /><p>{msg}</p>
    <p className="mut">{count} problems on this phone. Works in airplane mode.</p>
    <a className="btn primary" href="/app">Start solving</a></div>
    <div className="panel noprint"><div className="mut">Fallback: paste a code's text</div><textarea rows={3} value={paste} onChange={(e) => setPaste(e.target.value)} />
      <button onClick={() => setMsg(ingest(paste.trim()) ? 'Added' : 'Not a Primer code')}>Add</button></div></>);
}

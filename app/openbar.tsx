'use client';
// A floating Open button appears once the hero has scrolled away (phones only —
// desktop always keeps the button in the header nav).
import { useEffect, useState } from 'react';

export default function OpenBar() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const onScroll = () => setOn(window.scrollY > window.innerHeight * 0.9);
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    return () => removeEventListener('scroll', onScroll);
  }, []);
  return <a className={`openbar ${on ? 'on' : ''}`} href="/app">Open Primer</a>;
}

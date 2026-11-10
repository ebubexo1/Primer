'use client';
// Top-level navigation lives in a bottom tab bar (tab-bars.md): navigation, not actions,
// single-word labels, never hidden. Plain <a> on purpose: offline, a full navigation hits
// the service worker's cached page. pathname drives only the active state, never structure,
// so server and client markup always agree.
import { usePathname } from 'next/navigation';

const S = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

const tabs = [
  { href: '/app', label: 'Solve', glyph: <><rect x="4" y="3.5" width="16" height="17" rx="2.5"/><path d="M8 8.5h8M8 12h8M8 15.5h5"/></> },
  { href: '/decks', label: 'Decks', glyph: <><rect x="3.5" y="9.5" width="14" height="11" rx="2"/><path d="M7.5 9.5V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v7"/></> },
  { href: '/scan', label: 'Scan', glyph: <><path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2"/><rect x="9" y="9" width="6" height="6" rx="1.5"/></> },
  { href: '/teacher', label: 'Teacher', glyph: <><path d="M7 8V3.5h10V8"/><rect x="3.5" y="8" width="17" height="7.5" rx="2"/><path d="M7.5 13v6.5h9V13"/></> },
];

export default function TabBar() {
  const path = usePathname();
  return (
    <nav className="tabbar">
      {tabs.map((t) => (
        <a key={t.href} href={t.href} aria-current={path === t.href ? 'page' : undefined}>
          <svg {...S} aria-hidden="true">{t.glyph}</svg>{t.label}
        </a>
      ))}
    </nav>
  );
}

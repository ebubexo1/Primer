import './globals.css';
import SW from './sw';
import TabBar from './tabbar';
import { JetBrains_Mono } from 'next/font/google';

// Utility face for data (equations, history); UI text stays in the system face. Self-hosted: works offline.
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['500', '600'], variable: '--font-mono' });

export const metadata = { title: 'Primer', manifest: '/manifest.json' };
export const viewport = {
  width: 'device-width', initialScale: 1, viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f2f2f7' },
    { media: '(prefers-color-scheme: dark)', color: '#0d0f13' },
  ],
};
// Top-level navigation is a bottom tab bar; labels are single words per the HIG.
export default function Root({ children }: { children: React.ReactNode }) {
  return (<html lang="en" className={mono.variable}><body><SW />
    <main>{children}</main>
    <TabBar />
  </body></html>);
}

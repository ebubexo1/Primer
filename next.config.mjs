// CDN_URL (e.g. https://cdn.example.com) makes /_next/static load from the CDN origin.
// /sw.js must never be cached long-term: a frozen old worker serves stale chunks
// and pages keep crashing after route moves until site data is cleared.
export default {
  output: 'standalone',
  assetPrefix: process.env.CDN_URL || undefined,
  poweredByHeader: false,
  async headers() {
    return [{ source: '/sw.js',
      headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }] }];
  },
};

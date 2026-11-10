// CDN_URL (e.g. https://cdn.example.com) makes /_next/static load from the CDN origin.
export default { output: 'standalone', assetPrefix: process.env.CDN_URL || undefined, poweredByHeader: false };

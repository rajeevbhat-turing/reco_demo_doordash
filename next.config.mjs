// Extract hostname from PREFIX_URL environment variable
const prefixUrl = process.env.PREFIX_URL || '';
let prefixHostname = null;
if (prefixUrl) {
  try {
    const url = new URL(prefixUrl);
    prefixHostname = url.hostname;
  } catch {
    // Invalid URL, ignore
  }
}

// Build remote patterns dynamically
const remotePatterns = [
  {
    protocol: 'https',
    hostname: 'res.cloudinary.com',
    port: '',
    pathname: '/**',
  },
];

// Add PREFIX_URL hostname if available
if (prefixHostname) {
  remotePatterns.push({
    protocol: 'https',
    hostname: prefixHostname,
    port: '',
    pathname: '/**',
  });
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  output: 'standalone',
  images: {
    remotePatterns,
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  serverExternalPackages: ['sqlite3'],
};

export default nextConfig;

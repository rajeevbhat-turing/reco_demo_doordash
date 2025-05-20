/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.cdn4dd.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'doordash-static.s3.amazonaws.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
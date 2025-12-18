/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        // This captures all Firebase Auth internal paths
        source: '/__/auth/:path*',
        // Proxy requests to Firebase Auth backend
        destination: 'https://nutriscan-1zg7u.firebaseapp.com/__/auth/:path*',
      },
    ];
  },
};

export default nextConfig;

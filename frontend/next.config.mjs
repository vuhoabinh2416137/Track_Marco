/** @type {import('next').NextConfig} */
const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080').replace(/\/+$/, '');

const nextConfig = {
  reactStrictMode: false,
  transpilePackages: ['lucide-react'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

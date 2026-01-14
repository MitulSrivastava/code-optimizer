/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow downloading files from the backend API
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig

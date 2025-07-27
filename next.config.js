/** @type {import("next").NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true,
    domains: ['opguppjcyapztcdvzakj.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'opguppjcyapztcdvzakj.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}
module.exports = nextConfig

/** @type {import("next").NextConfig} */
const nextConfig = {
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
  typescript: {
    ignoreBuildErrors: false,
  },
}
module.exports = nextConfig

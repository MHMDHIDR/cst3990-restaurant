/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mhmdhidr-uploads-university.s3.eu-west-2.amazonaws.com',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
        pathname: '/random'
      }
    ]
  }
}

export default nextConfig

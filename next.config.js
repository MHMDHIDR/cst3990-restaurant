/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mhmdhidr-uploads.s3.amazonaws.com',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
        pathname: '/random'
      }
      /*
        // used for google login auth feature
        ,{protocol: 'https',hostname: 'lh3.googleusercontent.com',pathname: '/**'}
      */
    ]
  }
}

export default nextConfig

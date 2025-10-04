/** @type {import('next').NextConfig} */
const nextConfig = {
  // Set this back to true
  reactStrictMode: true,
  
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
}

module.exports = nextConfig

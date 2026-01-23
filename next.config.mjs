/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        path: false,
        os: false,
      };
    }
    return config;
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Note: The 'eslint' block is gone from here!
};

export default nextConfig;
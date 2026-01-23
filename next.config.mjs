/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add this line to satisfy the new build engine
  turbopack: {}, 
  
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
  }
};

export default nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@yantar/shared"],
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;

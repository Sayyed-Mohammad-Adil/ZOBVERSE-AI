import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow local network IP access without HMR websocket warnings in dev mode
  allowedDevOrigins: ["0.0.0.0", "localhost", "127.0.0.1"],
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "http://127.0.0.1:8000/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;

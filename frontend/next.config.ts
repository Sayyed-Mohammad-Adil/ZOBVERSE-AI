import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow local network IP access without HMR websocket warnings in dev mode
  allowedDevOrigins: ["0.0.0.0", "localhost", "127.0.0.1"],
  async rewrites() {
    const apiProxyUrl = (
      process.env.API_PROXY_URL || "http://127.0.0.1:8000"
    ).replace(/\/+$/, "");
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiProxyUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;

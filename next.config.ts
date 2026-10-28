import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Local browser/IDE and LAN preview hosts; applies only to next dev.
  allowedDevOrigins: ['localhost', '127.0.0.1', '192.168.18.10'],
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.compfest.id",
        pathname: "/event/xcelerate/*.svg",
      },
    ],
  },
};

export default nextConfig;

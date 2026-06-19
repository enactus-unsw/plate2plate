import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dximvafjowrzbngpspki.supabase.co",
      },
    ],
  },
};

export default nextConfig;

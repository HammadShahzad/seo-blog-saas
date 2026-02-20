import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Exclude sharp from the bundle so each platform uses its own native binary.
  // On the Droplet, sharp is installed once via `npm install sharp` in the app dir.
  serverExternalPackages: ["sharp"],
};

export default nextConfig;

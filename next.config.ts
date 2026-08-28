import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // This screen was /queue while listings waited for approval. Nothing
      // waits any more, so it is /listings, and anyone holding the old
      // bookmark is sent on rather than shown a 404.
      { source: "/queue", destination: "/listings", permanent: true },
      { source: "/queue/:id", destination: "/listings/:id", permanent: true },
    ];
  },
};

export default nextConfig;

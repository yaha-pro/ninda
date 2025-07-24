import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

module.exports = {
  images: {
    domains: ['s3.ap-northeast-1.amazonaws.com'], // S3 のドメイン
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Python/FastAPIサーバーが5328番ポートで起動することを想定
  // ローカル開発時のみ、/api/へのリクエストをそちらに転送する
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:5328/api/:path*',
      },
    ]
  },
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;

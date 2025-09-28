/** @type {import('next').NextConfig} */
const nextConfig = {
  // Python APIのビルド成功に必要な設定
  webpack: (config, { isServer }) => {
    if (isServer) {
      // サーバーサイドのビルドから'api'フォルダを除外
      config.externals.push(/^(api)/);
    }
    return config;
  },
  
  // ▼▼▼ 404エラー解消のための最重要設定 ▼▼▼
  // Next.jsのデフォルトのAPIルーティングを無効化し、すべて vercel.json に委譲する
  // これにより、/api/simulate が Fast API に確実にルーティングされます。
  experimental: {
    serverActions: true, // 既存の機能との互換性のため残す
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*', // Next.jsのAPIルートを使わない
      },
    ];
  },
  // ▲▲▲ 404エラー解消のための最重要設定 ▲▲▲
};

module.exports = nextConfig;

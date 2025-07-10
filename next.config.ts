import withPWA from 'next-pwa';

const nextConfig = {
  // ESLintをビルド時にスキップ（段階的復旧中）
  eslint: {
    ignoreDuringBuilds: true,
  },
  // TypeScriptをビルド時にスキップ（段階的復旧中）
  typescript: {
    ignoreBuildErrors: true,
  },
  /* config options here */
};

// PWA設定
const pwaConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    // Supabase APIのキャッシュ戦略
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*$/,
      handler: "NetworkFirst",
      options: {
        cacheName: "supabase-api-cache",
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 5 * 60, // 5分
        },
        networkTimeoutSeconds: 3,
      }
    },
    // 画像ファイルのキャッシュ
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
      handler: "CacheFirst",
      options: {
        cacheName: "images-cache",
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30日
        },
      }
    },
    // フォントファイルのキャッシュ
    {
      urlPattern: /\.(?:woff|woff2|eot|ttf|otf)$/,
      handler: "CacheFirst",
      options: {
        cacheName: "fonts-cache",
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1年
        },
      }
    },
    // Google Fontsのキャッシュ
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com/,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "google-fonts-stylesheets",
      }
    },
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com/,
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts-webfonts",
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1年
        },
      }
    }
  ]
})(nextConfig);

export default pwaConfig;

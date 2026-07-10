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
  // 画像最適化設定
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'laqvpxecqvlufboquffe.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      // YouTube サムネイル画像
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/vi/**',
      },
      // microCMS メディアライブラリ画像（ロボクエスト等のCSV運用コンテンツ）
      {
        protocol: 'https',
        hostname: 'images.microcms-assets.io',
      }
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
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
    // Supabase Storage画像のキャッシュ
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/v1\/object\/public\/.*\.(png|jpg|jpeg|webp|avif|gif|svg)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "supabase-images-cache",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7日
        },
      },
    },
    // YouTube サムネイル画像のキャッシュ
    {
      urlPattern: /^https:\/\/img\.youtube\.com\/vi\/.*\.(jpg|jpeg|webp|avif)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "youtube-thumbnails-cache",
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7日
        },
      },
    },
    // microCMS メディアライブラリ画像のキャッシュ
    {
      urlPattern: /^https:\/\/images\.microcms-assets\.io\/.*$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "microcms-images-cache",
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7日
        },
      },
    },
    // 一般画像ファイルのキャッシュ
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/,
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

import type { NextConfig } from "next";
import withPWA from "next-pwa";

const isProd = process.env.NODE_ENV === 'production';
const isGitHubPages = process.env.GITHUB_PAGES === 'true';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  swcMinify: true,
  
  // GitHub Pages用の設定
  output: isGitHubPages ? 'export' : undefined,
  basePath: isGitHubPages ? '/claft-next' : '',
  assetPrefix: isGitHubPages ? '/claft-next/' : '',
  trailingSlash: true,
  
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // パフォーマンス最適化
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  
  // バンドル分析設定
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // バンドル分析
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: true,
        })
      )
    }

    // パフォーマンス最適化
    config.optimization = {
      ...config.optimization,
      mergeDuplicateChunks: true,
      removeAvailableModules: true,
      removeEmptyChunks: true,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      },
    }

    return config
  },

  images: {
    // GitHub Pagesでは画像最適化を無効化
    unoptimized: isGitHubPages,
    // 画像最適化設定
    formats: isGitHubPages ? undefined : ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: [
      'localhost',
      'laqvpxecqvlufboquffe.supabase.co', // Supabase Storage
      'images.unsplash.com', // Unsplash
      'cdn.pixabay.com', // Pixabay
      'res.cloudinary.com', // Cloudinary
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
        pathname: '/**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // 最適化設定
    minimumCacheTTL: 60,
  },
  
  // 実験的機能
  experimental: {
    optimizePackageImports: ['lucide-react'],
    // パフォーマンス最適化
    optimizeCss: true,
    scrollRestoration: true,
  },

  // ヘッダー設定
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
};

// GitHub Pages用には PWA を無効化
const finalConfig = isGitHubPages ? nextConfig : withPWA({
  // @ts-ignore
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    // API キャッシュ
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*$/,
      handler: "NetworkFirst",
      options: {
        cacheName: "supabase-api-cache",
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 5 * 60, // 5分
        },
        networkTimeoutSeconds: 10,
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // 静的アセットキャッシュ
    {
      urlPattern: /\.(?:js|css|woff|woff2|ttf|eot|ico|png|jpg|jpeg|svg|gif)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "static-assets-cache",
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30日
        },
      },
    },
    // ページキャッシュ
    {
      urlPattern: /^https?.*$/,
      handler: "NetworkFirst",
      options: {
        cacheName: "page-cache",
        expiration: {
          maxEntries: 16,
          maxAgeSeconds: 24 * 60 * 60, // 1日
        },
        networkTimeoutSeconds: 3,
      },
    },
  ],
  buildExcludes: [/middleware-manifest\.json$/],
  fallbacks: {
    document: "/offline", // オフライン時のフォールバックページ
    image: "/icon-512.png",
    audio: "/silence.mp3",
    video: "/black.mp4",
    font: "/fonts/fallback.woff2",
  },
})(nextConfig);

export default finalConfig;

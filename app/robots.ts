import { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/utils/seo'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteConfig.url

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/unauthorized/',
          '/offline/',
          '/_next/',
          '/static/',
          '*.json',
          '*.xml',
        ],
        crawlDelay: 1,
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/quest/',
          '/profile/',
          '/share/',
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/unauthorized/',
          '/offline/',
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: [
          '/',
          '/quest/',
          '/profile/',
          '/share/',
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/unauthorized/',
          '/offline/',
        ],
        crawlDelay: 2,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
} 
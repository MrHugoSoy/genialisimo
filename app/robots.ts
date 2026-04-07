import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/profile', '/create'],
    },
    sitemap: 'https://genialisimo.com/sitemap.xml',
  }
}
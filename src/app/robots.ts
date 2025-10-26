import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  const sitemapUrl = 'https://eatinformed.amitdivekar.qzz.io/sitemap.xml';
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: sitemapUrl,
  }
}

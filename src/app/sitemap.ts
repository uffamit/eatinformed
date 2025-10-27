import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://eatinformed.amitdivekar.qzz.io';

  return [
    {
      url: baseUrl,
      lastModified: new Date('2024-10-27'),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${baseUrl}/check`,
      lastModified: new Date('2024-10-27'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]
}

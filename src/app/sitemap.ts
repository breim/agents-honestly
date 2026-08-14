import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/shared';
import { source } from '@/lib/source';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl },
    ...source
      .getPages()
      .filter((page) => page.url !== '/book/diagram-lab')
      .map((page) => ({ url: `${siteUrl}${page.url}` })),
  ];
}

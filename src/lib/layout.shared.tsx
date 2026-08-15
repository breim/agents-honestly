import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { appName, docsRoute, epubUrl, githubUrl } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      // JSX supported
      title: appName,
    },
    links: [
      { text: 'Book', url: docsRoute },
      { external: true, text: 'Download EPUB', url: epubUrl },
    ],
    githubUrl,
  };
}

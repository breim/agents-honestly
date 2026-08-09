import { getPageImageUrl, source } from '@/lib/source';
import { notFound } from 'next/navigation';
import { ImageResponse } from 'next/og';
import { generate as DefaultImage } from 'fumadocs-ui/og';
import { appName } from '@/lib/shared';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const revalidate = false;

/* Satori can't read the CSS font stack, so the weights the OG template uses
   (400 body, 600 site, 800 title) are registered explicitly. Read from disk
   rather than resolved: the geist exports map hides the font files, and the
   bundler rewrites require.resolve to a module id. Safe because every OG route
   is prerendered at build time, where node_modules is present. */
const geistSans = join(process.cwd(), 'node_modules/geist/dist/fonts/geist-sans');

const fonts = Promise.all(
  ([
    ['Geist-Regular.ttf', 400],
    ['Geist-SemiBold.ttf', 600],
    ['Geist-Black.ttf', 800],
  ] as const).map(async ([file, weight]) => ({
    name: 'Geist',
    data: await readFile(join(geistSans, file)),
    weight,
    style: 'normal' as const,
  })),
);

export async function GET(_req: Request, { params }: RouteContext<'/og/docs/[...slug]'>) {
  const { slug } = await params;
  const page = source.getPage(slug.slice(0, -1));
  if (!page) notFound();

  return new ImageResponse(
    <DefaultImage title={page.data.title} description={page.data.description} site={appName} />,
    {
      width: 1200,
      height: 630,
      fonts: await fonts,
    },
  );
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    lang: page.locale,
    slug: getPageImageUrl(page).segments,
  }));
}

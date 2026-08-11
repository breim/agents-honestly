import { ImageResponse } from 'next/og';
import { ogCard, ogContentType, ogFonts, ogSize } from '@/lib/og';
import { appName } from '@/lib/shared';

export const alt = `${appName}. A free handbook for agentic systems in production`;
export const size = ogSize;
export const contentType = ogContentType;

/* The card says what the hero says, so a shared link and the page it opens read the same. */
export default async function Image() {
  return new ImageResponse(
    await ogCard({
      title: 'Building an agent is easy.',
      description:
        'Building one that survives production is software engineering. Free to read in full, no signup, nothing for sale.',
    }),
    { ...size, fonts: await ogFonts },
  );
}

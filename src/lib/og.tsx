import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { appName } from './shared';

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = 'image/png';

/* Satori can't read the CSS font stack, so the weights the card uses (400 body, 600 mark,
   800 title) are registered explicitly. Read from disk rather than resolved: the geist
   exports map hides the font files, and the bundler rewrites require.resolve to a module
   id. Safe because every card is prerendered at build time, where node_modules is present. */
const geistSans = join(process.cwd(), 'node_modules/geist/dist/fonts/geist-sans');

export const ogFonts = Promise.all(
  (
    [
      ['Geist-Regular.ttf', 400],
      ['Geist-SemiBold.ttf', 600],
      ['Geist-Black.ttf', 800],
    ] as const
  ).map(async ([file, weight]) => ({
    name: 'Geist',
    data: await readFile(join(geistSans, file)),
    weight,
    style: 'normal' as const,
  })),
);

/* Cropped to the card's exact size ahead of time so it can be placed at 1:1. The source is
   one bit, and resampling an ordered dither averages it into grey, which is the same reason
   the landing renders its copy unoptimized. */
const background = readFile(join(process.cwd(), 'public/hero-dither-og.png')).then(
  (file) => `data:image/png;base64,${file.toString('base64')}`,
);

const INK = '#fafafa';
const GROUND = '10, 10, 10';

/** Long chapter titles are common enough that a fixed size overflows the card. */
function titleSize(title: string) {
  if (title.length > 46) return 54;
  if (title.length > 28) return 66;

  return 78;
}

/** Letters and digits only, so "Agents, Honestly" and "Agents Honestly" compare equal. */
const fold = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

export async function ogCard({ title, description }: { title: string; description?: string }) {
  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', position: 'relative' }}>
      <img
        alt=""
        src={await background}
        width={ogSize.width}
        height={ogSize.height}
        style={{ position: 'absolute' }}
      />

      {/* Densest behind the text and thinning to the right, where the roofline is free to
          come through. The same move as the landing's scrim, in one direction. */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundImage: `linear-gradient(to right, rgba(${GROUND}, 0.97), rgba(${GROUND}, 0.93) 48%, rgba(${GROUND}, 0.66))`,
        }}
      />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '100%',
          height: '100%',
          padding: 72,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 900 }}>
          <div
            style={{
              color: INK,
              fontSize: titleSize(title),
              fontWeight: 800,
              letterSpacing: '-0.035em',
              lineHeight: 1.04,
            }}
          >
            {title}
          </div>
          {description ? (
            <div
              style={{
                color: 'rgba(250, 250, 250, 0.66)',
                fontSize: 27,
                fontWeight: 400,
                lineHeight: 1.45,
                marginTop: 22,
              }}
            >
              {description}
            </div>
          ) : null}
        </div>

        {/* The book's own index is titled after the site, and printing the mark under it
            would say the name twice. */}
        {fold(title) === fold(appName) ? null : (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', width: 34, height: 2, backgroundColor: INK }} />
            <div
              style={{
                color: INK,
                fontSize: 26,
                fontWeight: 600,
                letterSpacing: '-0.01em',
                marginLeft: 16,
              }}
            >
              {appName}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

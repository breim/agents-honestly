import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement as h } from 'react';
import { ImageResponse } from 'next/dist/compiled/@vercel/og/index.node.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const size = { width: 1600, height: 2560 };
const INK = '#fafafa';
const GROUND = '10, 10, 10';

/* Placed at 1:1 rather than scaled to the cover: the source is one bit, and resampling an
   ordered dither averages it into grey. The crop is 1600x1280, so the art covers the top
   half and the scrim carries it into the ground the title sits on. */
const artHeight = 1280;

const geistSans = join(root, 'node_modules/geist/dist/fonts/geist-sans');

const fonts = await Promise.all(
  [
    ['Geist-Regular.ttf', 400],
    ['Geist-SemiBold.ttf', 600],
    ['Geist-Black.ttf', 800],
  ].map(async ([file, weight]) => ({
    name: 'Geist',
    data: await readFile(join(geistSans, file)),
    weight,
    style: 'normal',
  })),
);

const art = await readFile(join(root, 'public/hero-dither-cover.png')).then(
  (file) => `data:image/png;base64,${file.toString('base64')}`,
);

const element = h(
  'div',
  {
    style: {
      display: 'flex',
      width: '100%',
      height: '100%',
      position: 'relative',
      backgroundColor: `rgb(${GROUND})`,
    },
  },
  h('img', {
    alt: '',
    src: art,
    width: size.width,
    height: artHeight,
    style: { position: 'absolute', top: 0, left: 0 },
  }),
  h('div', {
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: artHeight,
      backgroundImage: `linear-gradient(to bottom, rgba(${GROUND}, 0.10), rgba(${GROUND}, 0) 22%, rgba(${GROUND}, 0.45) 66%, rgba(${GROUND}, 0.88) 86%, rgb(${GROUND}))`,
    },
  }),
  h(
    'div',
    {
      style: {
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
        padding: 120,
      },
    },
    h('div', { style: { display: 'flex', height: artHeight - 100 } }),
    h(
      'div',
      {
        style: {
          display: 'flex',
          flexDirection: 'column',
          color: INK,
          fontSize: 250,
          fontWeight: 800,
          letterSpacing: '-0.045em',
          lineHeight: 0.94,
        },
      },
      h('div', { style: { display: 'flex' } }, 'Agents,'),
      h('div', { style: { display: 'flex' } }, 'Honestly'),
    ),
    h(
      'div',
      { style: { display: 'flex', flexDirection: 'column' } },
      h('div', { style: { display: 'flex', width: 96, height: 4, backgroundColor: INK } }),
      h(
        'div',
        {
          style: {
            display: 'flex',
            color: INK,
            fontSize: 52,
            fontWeight: 600,
            letterSpacing: '-0.01em',
            marginTop: 36,
          },
        },
        'Henrique Breim',
      ),
    ),
  ),
);

const out = join(root, 'dist/cover.png');
await mkdir(dirname(out), { recursive: true });
await writeFile(out, Buffer.from(await new ImageResponse(element, { ...size, fonts }).arrayBuffer()));

console.log(`cover.png  ${size.width}x${size.height}`);

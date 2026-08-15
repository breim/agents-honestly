import type { WashOrigin } from './bayer';

export type WashEntry = {
  ball?: boolean;
  id: string;
  name: string;
  note: string;
  origin: WashOrigin;
  repeat?: number;
};

/** The one technique that actually shipped, taken apart. Every entry below is the same
    sixteen dot positions and the same per-cell mask as commit b26658a — only the origin
    moves, the shell repeats, or the result is clipped to a disc. */
export const washVariants: WashEntry[] = [
  {
    id: 'north',
    name: 'Overhead',
    note: 'The wash exactly as it shipped, origin just past the top edge.',
    origin: { cx: '50%', cy: '-18%', r: '76%' },
  },
  {
    id: 'south',
    name: 'Underlit',
    note: 'The same falloff from below. Lighting anything from underneath is the oldest cheap menace in film, and the dots know it too.',
    origin: { cx: '50%', cy: '118%', r: '76%' },
  },
  {
    id: 'west',
    name: 'Raking left',
    note: 'Origin off the left edge. The shells become vertical bands, because a circle far enough away is a straight line.',
    origin: { cx: '-18%', cy: '50%', r: '76%' },
  },
  {
    id: 'east',
    name: 'Raking right',
    note: 'The mirror, and the one the shipped hero should probably have been: it fades toward the reading column instead of away from it.',
    origin: { cx: '118%', cy: '50%', r: '76%' },
  },
  {
    id: 'corner',
    name: 'Corner',
    note: 'Origin off the top left. The shells cross the field on the diagonal, which is the only direction on a rectangle that never repeats a distance.',
    origin: { cx: '-8%', cy: '-8%', r: '112%' },
  },
  {
    id: 'centre',
    name: 'Centre',
    note: 'Origin brought inside the frame. Every shell closes into a ring, and the falloff turns from a wash into an object.',
    origin: { cx: '50%', cy: '50%', r: '64%' },
  },
  {
    id: 'tunnel',
    name: 'Tunnel',
    note: 'The shell repeated five times out from the centre. Nothing else changes — the rings are the same sixteen radii the wash always had, printed over and over instead of once.',
    origin: { cx: '50%', cy: '50%', r: '78%' },
    repeat: 5,
  },
  {
    ball: true,
    id: 'sphere',
    name: 'Sphere',
    note: 'The wash clipped to a disc, with the origin pushed up and to the left. No surface is solved and no light is computed: a falloff, cut to a circle, is a lit ball. This is the whole hero idiom, in one gradient and one clip path.',
    origin: { cx: '34%', cy: '30%', r: '72%' },
  },
];

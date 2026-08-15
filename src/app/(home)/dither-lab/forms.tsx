import { fields, type Field } from './fields';
import { Plate } from './plate';
import { bayerMatrix, fromMatrix, orderedDither } from './screens';

const cols = 96;
const rows = 54;
const aspect = cols / rows;

/** Bayer 4×4 throughout: the same matrix Bayer Wash was cut from, and the same one the
    landing page shipped. The forms below differ only in what they ask the matrix to print —
    any of the twenty screens above would drop straight in. */
const screen = orderedDither(fromMatrix(bayerMatrix(4)));

export function FormPlate({ field }: { field: Field }) {
  const ink = (x: number, y: number) =>
    field((x / (cols - 1) - 0.5) * aspect, y / (rows - 1) - 0.5);

  return <Plate cols={cols} dither={screen} ink={ink} rows={rows} />;
}

export type FormEntry = { field: Field; name: string; note: string; spec: string };

export const formEntries: FormEntry[] = [
  {
    field: fields.sphere,
    name: 'Sphere',
    note: 'The hero idiom of the last three years, and the one worth taking apart. There is no sphere: for every point inside the circle the surface height is solved directly, and the ink is how squarely that point faces a light up and to the left. Roundness is entirely the falloff — a lit ball assembled out of nothing but dot density.',
    spec: 'lambert falloff · solved per cell',
  },
  {
    field: fields.ripple,
    name: 'Ripple',
    note: 'Concentric rings losing height as they travel out. The dither does something a smooth gradient cannot here: the outer rings fall below one dot per cell and break into scattered grain instead of fading to nothing.',
    spec: 'radial sine · exponential decay',
  },
  {
    field: fields.wave,
    name: 'Wave',
    note: 'A sine bent by a second sine running the other way. Nothing more than that, and it is the cheapest field on the page that stops reading as stripes.',
    spec: 'sine of a sine',
  },
  {
    field: fields.swirl,
    name: 'Swirl',
    note: 'Straight arms around a centre, with the angle offset by the radius. No spiral is ever drawn; the spiral is what offsetting an angle by a radius means.',
    spec: 'polar · angle offset by radius',
  },
  {
    field: fields.simplex,
    name: 'Simplex',
    note: 'Two octaves of value noise, the second half the amplitude and twice the frequency of the first. Two, not four — and that is the entire lesson of this plate. A screen carries a gradient through quantisation; hand it detail finer than its own tile and there is no gradient left to carry, so the pattern fights the noise and the result is mud. The features here are all wider than the 4×4 tile, which is why this reads as cloud instead of static.',
    spec: 'fBm · 2 octaves',
  },
  {
    field: fields.warp,
    name: 'Warp',
    note: 'The same noise, sampled at coordinates another layer of noise has already displaced. One extra lookup and clouds turn into something poured.',
    spec: 'domain-warped fBm',
  },
  {
    field: fields.metaball,
    name: 'Metaball',
    note: 'Three points, each radiating a field that falls off with the square of distance. Where two overlap the sum crosses the threshold early, so the shapes reach for each other and fuse before they ever touch.',
    spec: '3 centres · inverse-square sum',
  },
  {
    field: fields.contour,
    name: 'Contour',
    note: 'Read the noise as elevation and print only where it crosses a fixed height. A contour map draws a surface entirely out of the places the surface is not — and at this cell size the lines break exactly where the slope goes flat.',
    spec: 'fBm elevation · banded',
  },
  {
    field: fields.vignette,
    name: 'Vignette',
    note: 'Ink at the edges, bare in the middle. The oldest trick in print for putting a subject somewhere without drawing anything around it, and the closest relative on this page to the wash the landing page actually shipped.',
    spec: 'radial edge falloff',
  },
  {
    field: fields.tunnel,
    name: 'Tunnel',
    note: 'Rings spaced by the reciprocal of the radius, which is what perspective does to anything evenly spaced running away from you. The centre is faded deliberately: the ring frequency there goes to infinity and the grid has nowhere to put it.',
    spec: 'reciprocal-radius rings',
  },
];

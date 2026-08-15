import { fields } from './fields';
import { bayerMatrix, fromMatrix, type Threshold } from './screens';

/** Every plate before this one answers a one-bit question: dot, or no dot. Give the device
    more than two inks and the question changes. The quantiser picks the two inks the wanted
    tone falls between, and the dither decides — per cell — which of those two to lay down.
    Two inks reduces to exactly the page so far, which is the point: 1-bit was never a
    different technique, only the smallest case of this one. */
export function paletteDither(threshold: Threshold, count: number) {
  return (cols: number, rows: number, ink: (x: number, y: number) => number) => {
    const grid = new Uint8Array(cols * rows);
    const top = count - 1;

    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        const wanted = ink(x, y) * top;
        const lower = Math.min(Math.floor(wanted), top - 1);

        grid[y * cols + x] = wanted - lower > threshold(x, y) ? lower + 1 : lower;
      }
    }

    return grid;
  };
}

/** One path per ink, so a plate of N inks costs N path elements rather than one per cell. */
function inkPaths(grid: Uint8Array, cols: number, rows: number, count: number) {
  const bars = Array.from({ length: count }, () => [] as string[]);

  for (let y = 0; y < rows; y += 1) {
    let current = -1;
    let run = 0;

    for (let x = 0; x <= cols; x += 1) {
      const value = x < cols ? grid[y * cols + x] : -1;

      if (value === current) {
        run += 1;
        continue;
      }

      if (run > 0 && current >= 0) bars[current].push(`M${x - run} ${y}h${run}v1h-${run}z`);
      current = value;
      run = 1;
    }
  }

  return bars.map((ink) => ink.join(''));
}

const bayer4 = fromMatrix(bayerMatrix(4));

export function PalettePlate({
  cols,
  field = fields.scene,
  inks,
  rows,
}: {
  cols: number;
  field?: (p: number, q: number) => number;
  inks: string[];
  rows: number;
}) {
  const ink = (x: number, y: number) => field((x / (cols - 1) - 0.5) * (cols / rows), y / (rows - 1) - 0.5);
  const grid = paletteDither(bayer4, inks.length)(cols, rows, ink);

  return (
    <svg
      aria-hidden
      className="block h-auto w-full"
      shapeRendering="crispEdges"
      viewBox={`0 0 ${cols} ${rows}`}
    >
      {inkPaths(grid, cols, rows, inks.length).map((d, index) => (
        <path d={d} fill={inks[index]} key={inks[index]} />
      ))}
    </svg>
  );
}

/** Grey steps mixed from the page's own two colours, so the ramp reads correctly whichever
    theme it lands in. */
export const greys = (count: number) =>
  Array.from(
    { length: count },
    (_, step) =>
      `color-mix(in oklab, var(--color-ink) ${Math.round((step / (count - 1)) * 100)}%, var(--color-ground))`,
  );

/** Recovered from bg-2.png on fumadocs.dev: the image holds exactly four colours, and the
    threshold order read back out of its pixels is Bayer 4×4 to the number. */
export const fumadocsInks = ['#000c38', '#40241c', '#803c00', '#e0bf00'];

export type CompositeEntry = {
  cols: number;
  field: (p: number, q: number) => number;
  inks: string[];
  name: string;
  note: string;
  spec: string;
};

/** Each form on this page is a single field. Layer them and you stop making demonstrations. */
export const compositeEntries: CompositeEntry[] = [
  {
    cols: 96,
    field: fields.glow,
    inks: greys(2),
    name: 'Glow',
    note: 'A light source with an exponential falloff and no edge anywhere. Not the sphere from earlier — a sphere has a silhouette, and a lamp seen through air must not.',
    spec: 'exponential falloff',
  },
  {
    cols: 96,
    field: fields.clouds,
    inks: greys(2),
    name: 'Cloud',
    note: 'Two octaves at low frequency, sampled twice as often vertically as horizontally. Both numbers matter and the first matters more: a screen carries a gradient through quantisation, so if the source has detail finer than the screen’s own tile there is no gradient left to carry and the plate turns to mud. Noise is not a dither and does not become one by being printed in two colours. Keep every feature wider than the tile and the dots go back to doing their job.',
    spec: 'fBm · 2 octaves · 2:1',
  },
  {
    cols: 96,
    field: fields.nocturne,
    inks: greys(2),
    name: 'Composite',
    note: 'The glow lifting the cloud behind it rather than replacing it, with a ragged ridge taking the bottom of the frame to nothing. Three fields, one picture — and the ridge is doing what a horizon does in a photograph, which is tell you where you are standing.',
    spec: 'glow + cloud + ridge',
  },
  {
    cols: 72,
    field: fields.nocturne,
    inks: fumadocsInks,
    name: 'Composite, four inks',
    note: 'The same three fields through the palette recovered from fumadocs.dev, at their cell scale. This is the procedural answer to a photograph: theirs is a real lamp against real cloud, fixed at export time; this is three functions that can be re-aimed, re-coloured, or re-cut at any size. Neither is the better trade — but only one of them can be a different picture tomorrow.',
    spec: '4 inks · bayer 4×4 · coarse cells',
  },
];

export type PaletteEntry = {
  cols: number;
  inks: string[];
  name: string;
  note: string;
  spec: string;
};

export const paletteEntries: PaletteEntry[] = [
  {
    cols: 128,
    inks: greys(2),
    name: 'Two inks',
    note: 'The whole page up to here. Bare or solid, and the screen chooses between them — printed at this size so the cases below have a baseline that is unmistakably the same machinery.',
    spec: '1-bit · bayer 4×4',
  },
  {
    cols: 128,
    inks: greys(3),
    name: 'Three inks',
    note: 'One mid-tone added, and the dither now works twice: between bare and mid, then between mid and solid. Half the field stops being dithered at all, because half the field can now be printed exactly.',
    spec: '3 inks · bayer 4×4',
  },
  {
    cols: 128,
    inks: greys(5),
    name: 'Five inks',
    note: 'The texture is retreating into the seams. Each added ink halves the distance the dither has to cover, so the dots survive only in the narrowing bands between one exact tone and the next.',
    spec: '5 inks · bayer 4×4',
  },
  {
    cols: 64,
    inks: fumadocsInks,
    name: 'Fumadocs',
    note: 'The recipe read back out of fumadocs.dev: four inks, Bayer 4×4, four-pixel cells, baked into a PNG at build time. The matrix is the same sixteen numbers this project already had in bayer.tsx. The coarser grid is theirs too — half the sampling of the plates above, which is what leaves the dots big enough to read as dots at a glance rather than as a texture.',
    spec: '4 inks · bayer 4×4 · 4px cells',
  },
];

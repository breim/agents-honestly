import type { Dither } from './screens';

/** `[ahead, down, weight]`, where `ahead` runs with the scan rather than to the right, so a
    kernel written once works in both directions of a serpentine pass. */
type Tap = readonly [number, number, number];
export type Kernel = { readonly divisor: number; readonly taps: readonly Tap[] };

/** Coefficients as published. Each row below reads like the kernel diagrams do, with the
    current cell at the origin and the error spilling forward and down. */
export const kernels = {
  /** Floyd & Steinberg, 1976. Four taps, the whole error, and still the default fifty years
      on: everything since trades more arithmetic for slightly less worming. */
  floydSteinberg: {
    divisor: 16,
    taps: [
      [1, 0, 7],
      [-1, 1, 3],
      [0, 1, 5],
      [1, 1, 1],
    ],
  },

  /** Jarvis, Judice & Ninke, 1976. Three times the taps, spread two rows deep. Smoother, and
      softer — error carried that far blurs the edges it came from. */
  jarvisJudiceNinke: {
    divisor: 48,
    taps: [
      [1, 0, 7],
      [2, 0, 5],
      [-2, 1, 3],
      [-1, 1, 5],
      [0, 1, 7],
      [1, 1, 5],
      [2, 1, 3],
      [-2, 2, 1],
      [-1, 2, 3],
      [0, 2, 5],
      [1, 2, 3],
      [2, 2, 1],
    ],
  },

  /** Stucki, 1981. Jarvis reweighted onto powers of two, which on the hardware of the day
      meant shifts instead of divides. Same shape, cheaper, marginally crisper. */
  stucki: {
    divisor: 42,
    taps: [
      [1, 0, 8],
      [2, 0, 4],
      [-2, 1, 2],
      [-1, 1, 4],
      [0, 1, 8],
      [1, 1, 4],
      [2, 1, 2],
      [-2, 2, 1],
      [-1, 2, 2],
      [0, 2, 4],
      [1, 2, 2],
      [2, 2, 1],
    ],
  },

  /** Burkes, 1988. Stucki with the third row deleted: nearly the same picture for two-thirds
      of the work, which is the trade most of these kernels are actually making. */
  burkes: {
    divisor: 32,
    taps: [
      [1, 0, 8],
      [2, 0, 4],
      [-2, 1, 2],
      [-1, 1, 4],
      [0, 1, 8],
      [1, 1, 4],
      [2, 1, 2],
    ],
  },

  /** Sierra, 1989. Ten taps that keep Jarvis's reach while pulling weight back toward the
      cell it came from, so detail survives better than the spread suggests. */
  sierra: {
    divisor: 32,
    taps: [
      [1, 0, 5],
      [2, 0, 3],
      [-2, 1, 2],
      [-1, 1, 4],
      [0, 1, 5],
      [1, 1, 4],
      [2, 1, 2],
      [-1, 2, 2],
      [0, 2, 3],
      [1, 2, 2],
    ],
  },

  /** Sierra's own two-row cut. One row of lookahead buffer instead of two. */
  twoRowSierra: {
    divisor: 16,
    taps: [
      [1, 0, 4],
      [2, 0, 3],
      [-2, 1, 1],
      [-1, 1, 2],
      [0, 1, 3],
      [1, 1, 2],
      [2, 1, 1],
    ],
  },

  /** Sierra Lite. Three taps and a divisor of four — the cheapest kernel that still looks
      like error diffusion rather than like noise. */
  sierraLite: {
    divisor: 4,
    taps: [
      [1, 0, 2],
      [-1, 1, 1],
      [0, 1, 1],
    ],
  },

  /** Bill Atkinson, for the original Macintosh. The one kernel that deliberately loses:
      six taps over a divisor of eight throw away a quarter of the error at every cell. Blacks
      block up and whites blow out, and the midtones come back sharper for it — the reason
      the Mac's dithered photographs still read as a look rather than a limitation. */
  atkinson: {
    divisor: 8,
    taps: [
      [1, 0, 1],
      [2, 0, 1],
      [-1, 1, 1],
      [0, 1, 1],
      [1, 1, 1],
      [0, 2, 1],
    ],
  },
} satisfies Record<string, Kernel>;

/** Quantise, then push what you got wrong onto cells you have not decided yet. Rows alternate
    direction — a serpentine pass — because a kernel that always leans the same way drags its
    own error into the diagonal streaks the literature calls worming. */
export function errorDiffusion({ divisor, taps }: Kernel): Dither {
  return (cols, rows, ink) => {
    const grid = new Uint8Array(cols * rows);
    const pending = new Float64Array(cols * rows);

    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) pending[y * cols + x] = ink(x, y);
    }

    for (let y = 0; y < rows; y += 1) {
      const backwards = y % 2 === 1;

      for (let step = 0; step < cols; step += 1) {
        const x = backwards ? cols - 1 - step : step;
        const wanted = pending[y * cols + x];
        const printed = wanted > 0.5 ? 1 : 0;
        const error = wanted - printed;

        grid[y * cols + x] = printed;

        for (const [ahead, down, weight] of taps) {
          const nx = x + (backwards ? -ahead : ahead);
          const ny = y + down;

          if (nx < 0 || nx >= cols || ny >= rows) continue;
          pending[ny * cols + nx] += (error * weight) / divisor;
        }
      }
    }

    return grid;
  };
}

/** Standard d-to-(x,y) Hilbert mapping: read the index two bits at a time, rotating the
    quadrant as you descend. */
function hilbertPoint(order: number, distance: number): [number, number] {
  const side = 1 << order;
  let x = 0;
  let y = 0;
  let remaining = distance;

  for (let span = 1; span < side; span *= 2) {
    const rx = 1 & (remaining >> 1);
    const ry = 1 & (remaining ^ rx);

    if (ry === 0) {
      if (rx === 1) {
        x = span - 1 - x;
        y = span - 1 - y;
      }
      [x, y] = [y, x];
    }

    x += span * rx;
    y += span * ry;
    remaining >>= 2;
  }

  return [x, y];
}

/** The grid is wider than it is tall, so it is walked as square Hilbert blocks laid side by
    side, every other block mirrored so the curve leaves one block near where it enters the
    next. */
function* hilbertWalk(cols: number, rows: number) {
  const order = Math.log2(rows);

  for (let block = 0; block * rows < cols; block += 1) {
    for (let step = 0; step < rows * rows; step += 1) {
      const [hx, hy] = hilbertPoint(order, step);

      yield [block * rows + (block % 2 === 1 ? rows - 1 - hx : hx), hy] as const;
    }
  }
}

/** Riemersma, 1998. Error diffusion's problem is that it needs a scan order, and a scan order
    is a direction the artefacts can line up along. So walk a Hilbert curve instead: it visits
    every cell, never jumps, and has no direction to speak of. The error goes into a short
    queue weighted so the most recent cell counts most, which bounds how far any one mistake
    can travel — the locality of an ordered screen, without the lattice. */
export function riemersma(depth = 16, ratio = 16): Dither {
  const raw = Array.from({ length: depth }, (_, i) => ratio ** (i / (depth - 1)));
  const scale = raw.reduce((sum, weight) => sum + weight, 0);
  const weights = raw.map((weight) => weight / scale);

  return (cols, rows, ink) => {
    const grid = new Uint8Array(cols * rows);
    const history = new Float64Array(depth);
    let oldest = 0;

    for (const [x, y] of hilbertWalk(cols, rows)) {
      let carried = 0;
      for (let i = 0; i < depth; i += 1) carried += history[(oldest + i) % depth] * weights[i];

      const wanted = ink(x, y) + carried;
      const printed = wanted > 0.5 ? 1 : 0;

      grid[y * cols + x] = printed;
      history[oldest] = wanted - printed;
      oldest = (oldest + 1) % depth;
    }

    return grid;
  };
}

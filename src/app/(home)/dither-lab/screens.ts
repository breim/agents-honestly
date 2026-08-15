/** Every plate on this page prints the same source through a different algorithm. A dither
    takes the grid it has to fill and the ink the source asks for at each cell (0 bare, 1
    solid), and answers the only question a one-bit device can answer: dot, or no dot. */
export type Dither = (
  cols: number,
  rows: number,
  ink: (x: number, y: number) => number,
) => Uint8Array;

/** An ordered screen never looks at its neighbours. It carries a threshold for every position
    and compares. That is the whole algorithm, and the reason it costs nothing. */
export type Threshold = (x: number, y: number) => number;

export function orderedDither(threshold: Threshold): Dither {
  return (cols, rows, ink) => {
    const grid = new Uint8Array(cols * rows);

    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        grid[y * cols + x] = ink(x, y) > threshold(x, y) ? 1 : 0;
      }
    }

    return grid;
  };
}

/** Bayer's recursion: each step quadruples the tile and offsets the four quadrants by
    [[0,2],[3,1]], so thresholds that land next to each other are never close in value. That
    is what disperses the dots — and what makes the crosshatch you can never quite unsee. */
export function bayerMatrix(size: number): number[][] {
  if (size === 1) return [[0]];

  const half = size / 2;
  const inner = bayerMatrix(half);
  const quadrant = [
    [0, 2],
    [3, 1],
  ];

  return Array.from({ length: size }, (_, y) =>
    Array.from(
      { length: size },
      (_, x) => 4 * inner[y % half][x % half] + quadrant[Math.floor(y / half)][Math.floor(x / half)],
    ),
  );
}

export function fromMatrix(matrix: number[][]): Threshold {
  const size = matrix.length;
  const levels = size * size;

  return (x, y) => (matrix[y % size][x % size] + 0.5) / levels;
}

/** Distance measured the short way round the tile, so a screen built from it repeats without
    a seam. */
const wrap = (distance: number) => distance - Math.round(distance);
const radius = (u: number, v: number, cu: number, cv: number) =>
  Math.hypot(wrap(u - cu), wrap(v - cv));

/** A spot function scores each position in the tile by how early it should take ink. A press
    cannot hold a lone pixel, so every screen a press actually uses grows ink outward from a
    shape — a dot, a diamond, a line — instead of scattering it. */
export const spots = {
  clusteredDot: (u: number, v: number) => radius(u, v, 0.5, 0.5),
  crosshatch: (u: number, v: number) => Math.min(Math.abs(wrap(u - 0.5)), Math.abs(wrap(v - 0.5))),
  diagonalLine: (u: number, v: number) => Math.abs(wrap(u - v - 0.5)),
  diamond: (u: number, v: number) => Math.abs(wrap(u - 0.5)) + Math.abs(wrap(v - 0.5)),
  horizontalLine: (u: number, v: number) => Math.abs(wrap(v - 0.5)),
  rotatedScreen: (u: number, v: number) =>
    Math.min(radius(u, v, 0.25, 0.25), radius(u, v, 0.75, 0.75)),
};

const tieBreak = bayerMatrix(8);

/** Rank the tile by the spot function: lowest score takes ink first. A line screen scores a
    whole row alike, so ties fall back to Bayer order — the line then thickens by scattering
    rather than filling in from the left. */
export function spotMatrix(size: number, spot: (u: number, v: number) => number): number[][] {
  const cells = Array.from({ length: size * size }, (_, index) => {
    const x = index % size;
    const y = Math.floor(index / size);

    return { score: spot((x + 0.5) / size, (y + 0.5) / size), tie: tieBreak[y % 8][x % 8], x, y };
  });

  cells.sort((a, b) => a.score - b.score || a.tie - b.tie);

  const matrix = Array.from({ length: size }, () => new Array<number>(size));
  cells.forEach(({ x, y }, rank) => {
    matrix[y][x] = rank;
  });

  return matrix;
}

/** No tile at all: hash the coordinate. Every cell decides alone, which is exactly why the
    result clumps — independence is not the same as evenness. */
export const whiteNoise: Threshold = (x, y) => {
  let hash = Math.imul(x, 0x1b873593) ^ Math.imul(y + 0x9e3779b9, 0xcc9e2d51);
  hash = Math.imul(hash ^ (hash >>> 15), 0x85ebca6b);
  hash ^= hash >>> 13;

  return (hash >>> 0) / 0x1_0000_0000;
};

/** Jimenez, SIGGRAPH 2014. A closed form with no table and no memory fetch, built for GPUs
    that have arithmetic to spare and no budget for a lookup. Not blue noise, but far closer
    to it than the cost suggests. */
export const interleavedGradientNoise: Threshold = (x, y) => {
  const magic = 0.06711056 * x + 0.00583715 * y;

  return (52.9829189 * (magic % 1)) % 1;
};

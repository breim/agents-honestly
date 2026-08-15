import type { Dither } from './screens';

/** Runs of lit cells merge into one horizontal bar before they become path data. A midtone
    row is mostly alternating dots and compresses badly; flat regions collapse to almost
    nothing, which is what keeps thirty of these on one page affordable. */
function renderPath(grid: Uint8Array, cols: number, rows: number) {
  const bars: string[] = [];

  for (let y = 0; y < rows; y += 1) {
    let run = 0;

    for (let x = 0; x <= cols; x += 1) {
      if (x < cols && grid[y * cols + x]) {
        run += 1;
        continue;
      }

      if (run > 0) bars.push(`M${x - run} ${y}h${run}v1h-${run}z`);
      run = 0;
    }
  }

  return bars.join('');
}

/** One cell of the grid is one unit of the viewBox, so the plate scales to whatever width it
    is given and the dots stay square. */
export function Plate({
  cols,
  dither,
  ink,
  rows,
}: {
  cols: number;
  dither: Dither;
  ink: (x: number, y: number) => number;
  rows: number;
}) {
  return (
    <svg
      aria-hidden
      className="block h-auto w-full text-ink"
      shapeRendering="crispEdges"
      viewBox={`0 0 ${cols} ${rows}`}
    >
      <path d={renderPath(dither(cols, rows, ink), cols, rows)} fill="currentColor" />
    </svg>
  );
}

import { fields } from './fields';
import { Plate } from './plate';
import { bayerMatrix, fromMatrix, orderedDither } from './screens';

/** The two knobs that get confused for each other. Matrix size is how many tones the screen
    can hold. Pixel scale is how big a cell is on screen. They are independent: a 16×16 matrix
    at four times the cell size holds every one of its 257 tones and still reads as blocks. */
export const matrixSizes = [2, 4, 8, 16];
export const pixelScales = [1, 2, 3, 4];

/** Cells across at scale 1. Every coarser scale samples the same field less often, which is
    what makes the dots bigger — the plate is always drawn at the same width. */
const base = 72;

export function ScaleCell({ scale, size }: { scale: number; size: number }) {
  const cols = Math.round(base / scale);
  const ink = (x: number, y: number) =>
    fields.sphere(x / (cols - 1) - 0.5, y / (cols - 1) - 0.5);

  return (
    <Plate cols={cols} dither={orderedDither(fromMatrix(bayerMatrix(size)))} ink={ink} rows={cols} />
  );
}

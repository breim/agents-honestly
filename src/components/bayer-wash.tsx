import { Fragment } from 'react';

const bayerMatrix = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

const cell = 3;
const tile = bayerMatrix.length * cell;
const levels = bayerMatrix.length ** 2;

const positions = bayerMatrix.flatMap((row, y) =>
  row.map((value, x) => ({ x, y, id: `${x}-${y}`, cut: (levels - value) / levels })),
);

/* Ordered dithering thresholds every cell of the matrix against the gradient
   underneath it, so a cell holding a high value only survives near the bright
   centre. One masked layer per cell reproduces that without a per-pixel filter,
   and the density steps in 16 stages instead of fading. */
export function BayerWash() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 size-full text-fd-primary opacity-[0.12] contrast-more:hidden dark:opacity-[0.16]"
    >
      <defs>
        {positions.map(({ x, y, id, cut }) => (
          <Fragment key={id}>
            <pattern
              id={`bayer-cell-${id}`}
              width={tile}
              height={tile}
              patternUnits="userSpaceOnUse"
            >
              <rect x={x * cell} y={y * cell} width={cell} height={cell} fill="currentColor" />
            </pattern>
            <radialGradient id={`bayer-cut-${id}`} cx="50%" cy="-18%" r="76%">
              <stop offset={cut} stopColor="white" />
              <stop offset={cut} stopColor="black" />
            </radialGradient>
            <mask id={`bayer-mask-${id}`}>
              <rect width="100%" height="100%" fill={`url(#bayer-cut-${id})`} />
            </mask>
          </Fragment>
        ))}
      </defs>
      {positions.map(({ id }) => (
        <rect
          key={id}
          width="100%"
          height="100%"
          fill={`url(#bayer-cell-${id})`}
          mask={`url(#bayer-mask-${id})`}
        />
      ))}
    </svg>
  );
}

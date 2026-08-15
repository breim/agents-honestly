import { Fragment } from 'react';

/** Bayer 4×4. Seventeen tones, and only seventeen: a finer matrix buys tones the eye cannot
    tell apart, which turns the dither back into the gradient it exists to replace. */
const matrix = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

const size = matrix.length;

/** Level 0 prints bare paper, level 16 prints solid ink. */
const solid = size ** 2;

const dots = matrix.flatMap((row, y) =>
  row.map((threshold, x) => ({ key: `${x}-${y}`, threshold, x, y })),
);

export function Tile({ cell, id, level }: { cell: number; id: string; level: number }) {
  const tile = size * cell;

  return (
    <pattern height={tile} id={id} patternUnits="userSpaceOnUse" width={tile}>
      {dots
        .filter((dot) => dot.threshold < level)
        .map(({ key, x, y }) => (
          <rect key={key} fill="currentColor" height={cell} width={cell} x={x * cell} y={y * cell} />
        ))}
    </pattern>
  );
}

type FieldProps = { cell?: number; className?: string; id: string; level: number };

/** A flat field held at one of the seventeen tones. */
export function BayerField({ cell = 4, className = '', id, level }: FieldProps) {
  const prefix = `bayer-field-${id}`;

  return (
    <svg aria-hidden className={`pointer-events-none ${className}`} preserveAspectRatio="none">
      <defs>
        <Tile cell={cell} id={prefix} level={level} />
      </defs>
      <rect fill={`url(#${prefix})`} height="100%" width="100%" />
    </svg>
  );
}

type RampProps = {
  cell?: number;
  className?: string;
  /** The edge the ink is densest at. The tone steps down from there to `floor`. */
  dense: 'left' | 'right';
  floor?: number;
  id: string;
  /** The heaviest tone the ramp reaches. Solid ink for an edge, lighter for a ground. */
  peak?: number;
  steps?: number;
};

/** Ink laid across the field in visible steps rather than as a continuum. */
export function BayerRamp({
  cell = 4,
  className = '',
  dense,
  floor = 1,
  id,
  peak = solid,
  steps = 8,
}: RampProps) {
  const prefix = `bayer-ramp-${id}`;
  const bands = Array.from({ length: steps }, (_, step) => ({
    level: Math.round(peak - ((peak - floor) * step) / (steps - 1)),
    span: ((step + 1) / steps) * 100,
    step,
  })).reverse();

  return (
    <svg aria-hidden className={`pointer-events-none ${className}`} preserveAspectRatio="none">
      <defs>
        {bands.map(({ level, step }) => (
          <Tile cell={cell} id={`${prefix}-${step}`} key={step} level={level} />
        ))}
      </defs>
      {bands.map(({ span, step }) => (
        <rect
          fill={`url(#${prefix}-${step})`}
          height="100%"
          key={step}
          width={`${span}%`}
          x={dense === 'right' ? `${100 - span}%` : 0}
        />
      ))}
    </svg>
  );
}

/** The seventeen tones laid side by side, bare paper to solid ink: the calibration strip a
    print shop runs along the edge of a sheet to prove the press is honest. */
export function BayerStrip({ className = '', id }: { className?: string; id: string }) {
  const prefix = `bayer-strip-${id}`;
  const cell = 2;
  const tile = size * cell;
  const levels = Array.from({ length: solid + 1 }, (_, level) => level);

  return (
    <svg
      aria-hidden
      className={`pointer-events-none ${className}`}
      viewBox={`0 0 ${tile * levels.length} ${tile}`}
    >
      <defs>
        {levels.map((level) => (
          <Tile cell={cell} id={`${prefix}-${level}`} key={level} level={level} />
        ))}
      </defs>
      {levels.map((level) => (
        <rect fill={`url(#${prefix}-${level})`} height={tile} key={level} width={tile} x={level * tile} />
      ))}
    </svg>
  );
}

/** Where the light sits, and how far it reaches. */
export type WashOrigin = { cx: string; cy: string; r: string };

/** The wash as the hero shipped it: light overhead, just off the top edge. */
const overhead: WashOrigin = { cx: '50%', cy: '-18%', r: '76%' };

/** A dot position is visible out to its own radius and not one pixel further. With one shell
    that is a single falloff — the wash. Repeat the shell and the same construction becomes
    rings, each one fading exactly the way the whole wash used to. */
function shellStops(cut: number, repeat: number) {
  return Array.from({ length: repeat }, (_, band) => [
    { at: band / repeat, ink: 'white' },
    { at: (band + cut) / repeat, ink: 'white' },
    { at: (band + cut) / repeat, ink: 'black' },
    { at: (band + 1) / repeat, ink: 'black' },
  ]).flat();
}

type WashProps = {
  /** Confine the wash to a disc. The falloff then reads as a ball lit from wherever the
      origin sits, rather than as a glow across the whole field. */
  ball?: boolean;
  className?: string;
  id: string;
  origin?: WashOrigin;
  repeat?: number;
};

/** The original hero background (commit b26658a): a Bayer-ordered dither wash, cut by a
    radial gradient per matrix cell so the field reads as a soft glow built entirely out of
    the same sixteen dot positions, rather than a blurred gradient.

    Nothing in the output is soft. Every edge is hard; the gradient exists only inside the
    masks, where it decides which of the sixteen dots survive at each distance. Moving the
    origin, repeating the shell, or clipping the result to a disc all leave that construction
    untouched — which is why one hero background turns out to be a family. */
export function BayerWash({
  ball = false,
  className = '',
  id,
  origin = overhead,
  repeat = 1,
}: WashProps) {
  const prefix = `bayer-wash-${id}`;
  const cell = 3;
  const tile = size * cell;
  const levels = size * size;

  const positions = matrix.flatMap((row, y) =>
    row.map((value, x) => ({ x, y, id: `${x}-${y}`, cut: (levels - value) / levels })),
  );

  return (
    <svg aria-hidden className={`pointer-events-none ${className}`} preserveAspectRatio="none">
      <defs>
        {ball && (
          <clipPath id={`${prefix}-ball`}>
            <circle cx="50%" cy="50%" r="34%" />
          </clipPath>
        )}
        {positions.map(({ x, y, id: slot, cut }) => (
          <Fragment key={slot}>
            <pattern
              height={tile}
              id={`${prefix}-cell-${slot}`}
              patternUnits="userSpaceOnUse"
              width={tile}
            >
              <rect fill="currentColor" height={cell} width={cell} x={x * cell} y={y * cell} />
            </pattern>
            <radialGradient cx={origin.cx} cy={origin.cy} id={`${prefix}-cut-${slot}`} r={origin.r}>
              {shellStops(cut, repeat).map(({ at, ink }, index) => (
                <stop key={index} offset={at} stopColor={ink} />
              ))}
            </radialGradient>
            <mask id={`${prefix}-mask-${slot}`}>
              <rect fill={`url(#${prefix}-cut-${slot})`} height="100%" width="100%" />
            </mask>
          </Fragment>
        ))}
      </defs>
      <g clipPath={ball ? `url(#${prefix}-ball)` : undefined}>
        {positions.map(({ id: slot }) => (
          <rect
            fill={`url(#${prefix}-cell-${slot})`}
            height="100%"
            key={slot}
            mask={`url(#${prefix}-mask-${slot})`}
            width="100%"
          />
        ))}
      </g>
    </svg>
  );
}

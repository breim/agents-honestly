import { BayerField, BayerRamp, BayerWash, Tile } from './bayer';
import { errorDiffusion, kernels } from './diffusion';
import { avatarField, fields, type Field } from './fields';
import { Plate } from './plate';
import { bayerMatrix, fromMatrix, orderedDither, spotMatrix, spots } from './screens';

const bayer4 = orderedDither(fromMatrix(bayerMatrix(4)));

function square(field: Field, cols: number) {
  return (x: number, y: number) => field(x / (cols - 1) - 0.5, y / (cols - 1) - 0.5);
}

/** Sixteen tones of cover, laid in bands, in the colour of the page itself. Where the cover is
    dense the text underneath is gone; where it is sparse the text survives with holes in it.
    A gradient mask does the same job with a smooth alpha and bands where the display runs out
    of levels — this runs out of levels on purpose, and there is nothing left to band. */
function FadeCover({ id, steps = 8 }: { id: string; steps?: number }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 flex h-28 flex-col">
      {Array.from({ length: steps }, (_, band) => (
        <BayerField
          cell={3}
          className="w-full flex-1 text-surface"
          id={`${id}-${band}`}
          key={band}
          level={Math.round(((band + 1) / steps) * 16)}
        />
      ))}
    </div>
  );
}

const sample =
  'A run that has been going for three weeks does not fit in a context window, and the worker that started it is long gone. What survives is the journal: every step it took, in order, and every answer it got back.';

function FadeDemo() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {(['gradient', 'dither'] as const).map((kind) => (
        <div key={kind}>
          <div className="relative h-40 overflow-hidden">
            <p className="text-note text-quiet">{sample}</p>
            {kind === 'gradient' ? (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-linear-to-b from-transparent to-surface"
              />
            ) : (
              <FadeCover id="fade" />
            )}
          </div>
          <p className="mt-2 text-caption text-quiet">
            {kind === 'gradient' ? 'linear-gradient mask' : 'dithered cover'}
          </p>
        </div>
      ))}
    </div>
  );
}

/** The same cover, held at five points on its way from nothing to everything. Hand the level
    to a hover, a scroll position, or a clock and the five frames are a transition. */
function DissolveDemo() {
  return (
    <div className="grid grid-cols-5 gap-2">
      {[0, 4, 8, 12, 16].map((level) => (
        <div key={level}>
          <div className="relative aspect-square overflow-hidden border border-rule">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-caption font-bold text-ink">RUN</span>
            </div>
            <BayerField
              cell={3}
              className="absolute inset-0 size-full text-surface"
              id={`dissolve-${level}`}
              level={level}
            />
          </div>
          <p className="mt-1.5 text-center text-caption text-quiet tabular-nums">
            {level}/16
          </p>
        </div>
      ))}
    </div>
  );
}

/** Letterforms as a mask over a tonal ramp, so the type is not filled with a dither — the type
    is the only place the dither exists. */
function KnockoutDemo() {
  const bands = 10;
  const width = 320;
  const span = width / bands;

  return (
    <svg aria-label="DITHER" className="w-full text-ink" role="img" viewBox={`0 0 ${width} 74`}>
      <defs>
        {Array.from({ length: bands }, (_, band) => (
          <Tile
            cell={2}
            id={`knockout-${band}`}
            key={band}
            level={Math.round(2 + (band / (bands - 1)) * 14)}
          />
        ))}
        <mask id="knockout-type">
          <text
            fill="white"
            fontSize="58"
            fontWeight="700"
            letterSpacing="-0.03em"
            textAnchor="middle"
            x={width / 2}
            y="56"
          >
            DITHER
          </text>
        </mask>
      </defs>
      <g mask="url(#knockout-type)">
        {Array.from({ length: bands }, (_, band) => (
          <rect
            fill={`url(#knockout-${band})`}
            height="74"
            key={band}
            width={span}
            x={band * span}
          />
        ))}
      </g>
    </svg>
  );
}

const seeds = ['worker-01', 'worker-02', 'scheduler', 'journal', 'replay', 'compensate'];

function AvatarDemo() {
  return (
    <div className="flex flex-wrap gap-5">
      {seeds.map((seed, index) => (
        <div key={seed}>
          <div className="size-20 overflow-hidden border border-rule">
            <Plate cols={36} dither={bayer4} ink={square(avatarField(index + 1), 36)} rows={36} />
          </div>
          <p className="mt-1.5 text-caption text-quiet">{seed}</p>
        </div>
      ))}
    </div>
  );
}

/** A rule that is a band of tone rather than a line of ink. It reads as a division without
    ever committing to an edge, which is the whole reason to reach for one. */
function RuleDemo() {
  return (
    <div className="space-y-8">
      <div className="flex h-2">
        <BayerRamp className="h-full flex-1" dense="right" floor={0} id="rule-a" peak={6} steps={7} />
        <BayerRamp className="h-full flex-1" dense="left" floor={0} id="rule-b" peak={6} steps={7} />
      </div>
      <BayerField cell={3} className="h-2 w-full text-ink" id="rule-flat" level={4} />
    </div>
  );
}

function OrnamentDemo() {
  return (
    <div className="landing-panel relative overflow-hidden p-6">
      <BayerWash
        className="absolute right-0 top-0 size-40 text-ink"
        id="ornament"
        origin={{ cx: '100%', cy: '0%', r: '100%' }}
      />
      <p className="relative text-caption text-quiet">workflow.replay</p>
      <p className="relative mt-1 text-headline">Step 41 of 128</p>
      <p className="relative mt-2 max-w-[34ch] text-caption text-quiet">
        The ornament is the wash with its origin pinned to the corner. Nothing new was drawn.
      </p>
    </div>
  );
}

/** A skeleton whose motion is the screen sliding under the block, not a highlight sweeping
    over it. One tile of travel, so the loop has no seam. */
function SkeletonDemo() {
  return (
    <div className="space-y-3">
      {[11, 8, 5].map((level, index) => (
        <div
          className="h-4 overflow-hidden"
          key={level}
          style={{ width: `${[100, 82, 54][index]}%` }}
        >
          <BayerField
            cell={4}
            className="dither-shimmer h-full w-[calc(100%+16px)] text-quiet"
            id={`skeleton-${level}`}
            level={level}
          />
        </div>
      ))}
    </div>
  );
}

function EmptyStateDemo() {
  return (
    <div className="landing-panel relative flex h-52 items-center justify-center overflow-hidden">
      <BayerWash
        className="absolute inset-0 size-full text-ink"
        id="empty"
        origin={{ cx: '50%', cy: '50%', r: '58%' }}
      />
      <div className="relative text-center">
        <p className="text-headline">No runs recorded</p>
        <p className="mt-1 text-caption text-quiet">The journal is empty for this window.</p>
      </div>
    </div>
  );
}

const treatments = [
  { dither: orderedDither(fromMatrix(bayerMatrix(8))), label: 'bayer 8×8' },
  { dither: orderedDither(fromMatrix(spotMatrix(8, spots.clusteredDot))), label: 'clustered dot' },
  { dither: errorDiffusion(kernels.floydSteinberg), label: 'floyd–steinberg' },
];

function TreatmentDemo() {
  const cols = 84;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {treatments.map(({ dither, label }) => (
        <div key={label}>
          <div className="overflow-hidden border border-rule">
            <Plate cols={cols} dither={dither} ink={square(fields.scene, cols)} rows={cols} />
          </div>
          <p className="mt-2 text-caption text-quiet">{label}</p>
        </div>
      ))}
    </div>
  );
}

export type Application = { demo: React.ReactNode; name: string; note: string; spec: string };

export const applications: Application[] = [
  {
    demo: <FadeDemo />,
    name: 'Fade mask',
    note: 'The one a senior designer reaches for weekly, and the inversion of everything above: here the dither is not the picture, it is the tool acting on one. A cover in the page colour, laid in sixteen tones, eats text away toward an edge. The gradient beside it does the same job and bands, because a smooth alpha ramp has to land on real display levels eventually. The dithered one has already landed on them.',
    spec: '8 bands · page-coloured cover',
  },
  {
    demo: <DissolveDemo />,
    name: 'Dissolve',
    note: 'The same cover held at five points between nothing and everything. Static, this is a filmstrip; hand the level to a hover, a scroll position, or a clock and it is the transition every game and every copy of Photoshop has shipped since the eighties.',
    spec: 'cover level 0 → 16',
  },
  {
    demo: <KnockoutDemo />,
    name: 'Type knockout',
    note: 'Letterforms used as the mask rather than as the subject, over a ramp that runs light to dark across the word. The type is not filled with a dither; the type is the only place the dither exists.',
    spec: 'text mask · 10-band ramp',
  },
  {
    demo: <AvatarDemo />,
    name: 'Generative avatar',
    note: 'Noise mirrored about its own vertical axis and thresholded. The mirror is the whole trick — it is what makes a hash read as a face instead of as static — and the seed is the only input, so the same worker gets the same mark forever.',
    spec: 'seeded fBm · mirrored',
  },
  {
    demo: <RuleDemo />,
    name: 'Divider',
    note: 'A rule made of tone instead of a line of ink: one band fading out toward both margins, one flat. It divides without ever committing to an edge, which is the entire reason to use one instead of a hairline.',
    spec: '2px band · levels 4–6',
  },
  {
    demo: <OrnamentDemo />,
    name: 'Corner ornament',
    note: 'The wash again, origin pinned to the corner of a card. Nothing new is drawn and nothing new is computed — the same construction that made the hero makes the corner, which is what having a material rather than an effect actually buys you.',
    spec: 'wash · origin at 100% 0%',
  },
  {
    demo: <SkeletonDemo />,
    name: 'Loading skeleton',
    note: 'Three bars at falling tone, with the screen sliding one tile under the block. The motion is the pattern moving, not a highlight sweeping over a grey box — and it travels exactly one tile, so the loop has no seam.',
    spec: '16px travel · steps(4)',
  },
  {
    demo: <EmptyStateDemo />,
    name: 'Empty state',
    note: 'The state most likely to ship undesigned. A centre wash behind the message costs nothing, comes from the same sixteen dots as everything else, and stops an empty panel from reading as a broken one.',
    spec: 'wash · centre origin',
  },
  {
    demo: <TreatmentDemo />,
    name: 'Image treatment',
    note: 'A lit ball on a graded ground — the closest thing this page can generate to a photograph — through three of the screens above. This is where the choice stops being cosmetic: Bayer holds the gradient and stamps a lattice on it, the clustered dot survives being printed, and Floyd–Steinberg keeps the edge at the horizon that both ordered screens smear.',
    spec: '3 screens · one scene',
  },
];

import { Fragment, type CSSProperties } from 'react';

interface Band {
  label: string;
  part?: string;
  items?: string[];
  flow?: string[];
  via?: string;
  tone?: number;
  plain?: boolean;
}

type Row = Band | { split: Band[] };

interface LayersProps {
  bands: Row[];
  spans?: Band[];
}

const RULE = 'color-mix(in oklab, var(--viz-muted) 55%, transparent)';
const toneColor = (tone?: number) => (tone ? `var(--viz-${tone})` : 'var(--viz-muted)');

const isSplit = (row: Row): row is { split: Band[] } => 'split' in row;
const centre = (i: number, n: number) => `${(100 / n) * (i + 0.5)}%`;

function Corner({ style, className = '' }: { style: CSSProperties; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute size-[5px] ${className}`}
      style={{ borderTop: `1px solid ${RULE}`, borderInlineEnd: `1px solid ${RULE}`, ...style }}
    />
  );
}

// Below 34rem a split can no longer sit side by side, so every connector and
// bracket collapses to the same shape: a short rail with its label beside it,
// mirroring `.conn, .is-merge` in the source's narrow-screen block.
function Connector({ label }: { label: string }) {
  return (
    <div className="relative flex h-[2.1rem] items-center max-[34rem]:h-auto max-[34rem]:gap-[0.55rem] max-[34rem]:py-[0.4rem]">
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-1/2 w-px max-[34rem]:relative max-[34rem]:inset-auto max-[34rem]:h-6 max-[34rem]:flex-none max-[34rem]:ms-4"
        style={{ background: RULE }}
      >
        <Corner style={{ left: '50%', bottom: 0, transform: 'translateX(-50%) rotate(135deg)' }} />
      </span>
      <span className="absolute top-1/2 left-[calc(50%+0.7rem)] -translate-y-1/2 text-[0.6875rem] font-medium whitespace-nowrap text-fd-muted-foreground max-[34rem]:static max-[34rem]:top-auto max-[34rem]:left-auto max-[34rem]:translate-y-0 max-[34rem]:whitespace-normal">
        {label}
      </span>
    </div>
  );
}

function MergeBracket({ prev, label }: { prev: number; label?: string }) {
  return (
    <div className="relative flex h-[2.9rem] items-center max-[34rem]:h-auto max-[34rem]:gap-[0.55rem] max-[34rem]:py-[0.4rem]">
      <span
        aria-hidden="true"
        className="absolute inset-0 max-[34rem]:relative max-[34rem]:inset-auto max-[34rem]:h-6 max-[34rem]:w-px max-[34rem]:flex-none max-[34rem]:ms-4"
      >
        {Array.from({ length: prev }, (_, c) => (
          <span
            key={c}
            aria-hidden="true"
            className="absolute top-0 h-1/2 w-px max-[34rem]:hidden"
            style={{ left: centre(c, prev), background: RULE }}
          />
        ))}
        <span
          aria-hidden="true"
          className="absolute top-1/2 h-px max-[34rem]:hidden"
          style={{ left: centre(0, prev), right: centre(0, prev), background: RULE }}
        />
        <span
          aria-hidden="true"
          className="absolute top-1/2 bottom-0 left-1/2 w-px max-[34rem]:top-0 max-[34rem]:left-0"
          style={{ background: RULE }}
        >
          <Corner style={{ left: '50%', bottom: 0, transform: 'translateX(-50%) rotate(135deg)' }} />
        </span>
      </span>
      {label && (
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[0.6875rem] font-medium whitespace-nowrap text-fd-muted-foreground max-[34rem]:static max-[34rem]:translate-x-0 max-[34rem]:whitespace-normal">
          {label}
        </span>
      )}
    </div>
  );
}

// A fork bracket only makes sense across side-by-side columns; with one
// column below it, `.is-fork { display: none }` in the source and this does
// the same.
function ForkBracket({ n }: { n: number }) {
  return (
    <div aria-hidden="true" className="relative h-[2.1rem] max-[34rem]:hidden">
      <span className="absolute top-0 left-1/2 h-1/2 w-px" style={{ background: RULE }} />
      <span className="absolute top-1/2 h-px" style={{ left: centre(0, n), right: centre(0, n), background: RULE }} />
      {Array.from({ length: n }, (_, c) => (
        <span key={c} className="absolute bottom-0 h-1/2 w-px" style={{ left: centre(c, n), background: RULE }} />
      ))}
    </div>
  );
}

function ItemList({ items }: { items: string[] }) {
  return (
    <ul className="m-0 mt-[0.4rem] flex flex-wrap items-baseline gap-x-2 p-0 text-[0.8125rem] text-fd-muted-foreground">
      {items.map((item, i) => (
        <li key={item} className="flex list-none items-baseline gap-2">
          {i > 0 && (
            <span aria-hidden="true" className="text-[var(--viz-grid)]">
              ·
            </span>
          )}
          {item}
        </li>
      ))}
    </ul>
  );
}

function BandBox({ band }: { band: Band }) {
  if (band.plain) {
    return (
      <div className="flex items-baseline justify-center py-[0.35rem]">
        <span className="text-[0.8125rem] font-medium text-fd-muted-foreground">{band.label}</span>
      </div>
    );
  }

  const color = toneColor(band.tone);

  return (
    <div
      className="h-full rounded-[0.4rem] px-[0.85rem] py-[0.7rem]"
      style={{
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: `color-mix(in oklab, ${color} 40%, var(--viz-grid))`,
        borderInlineStartWidth: '2px',
        borderInlineStartColor: color,
        background: `color-mix(in oklab, ${color} 8%, transparent)`,
      }}
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[0.9375rem] leading-[1.3] font-semibold tracking-[-0.01em] text-fd-foreground">
          {band.label}
        </span>
        {band.part && (
          <span
            className="text-[0.6875rem] font-semibold tracking-[0.06em] whitespace-nowrap uppercase"
            style={{ color: `color-mix(in oklab, ${color} 70%, var(--viz-muted))` }}
          >
            {band.part}
          </span>
        )}
      </div>

      {band.flow && (
        <div className="mt-[0.55rem] flex flex-wrap items-center gap-[0.4rem]">
          {band.flow.map((step, i) => (
            <Fragment key={i}>
              {i > 0 && (
                <span aria-hidden="true" className="relative h-px w-[1.1rem] flex-none" style={{ background: RULE }}>
                  <Corner style={{ insetInlineEnd: 0, top: '50%', transform: 'translateY(-50%) rotate(45deg)' }} />
                </span>
              )}
              <span className="text-xs text-fd-foreground">{step}</span>
            </Fragment>
          ))}
        </div>
      )}

      {band.items && <ItemList items={band.items} />}
    </div>
  );
}

export function Layers({ bands, spans = [] }: LayersProps) {
  const rows = bands.map((row) => (isSplit(row) ? row.split : [row]));

  const shape = rows.map((cols, i) => {
    const prev = i > 0 ? rows[i - 1].length : 1;
    const n = cols.length;
    const bracket: 'fork' | 'merge' | null = n > prev ? 'fork' : n < prev ? 'merge' : null;
    return {
      cols,
      n,
      prev,
      bracket,
      mergeLabel: bracket === 'merge' ? cols[0].via : undefined,
    };
  });

  return (
    <div className="flex flex-col">
      {shape.map(({ cols, n, prev, bracket, mergeLabel }, i) => (
        <div key={i}>
          {bracket === 'merge' && <MergeBracket prev={prev} label={mergeLabel} />}
          {bracket === 'fork' && <ForkBracket n={n} />}

          <div
            className="grid grid-cols-[repeat(var(--cols),1fr)] items-stretch gap-x-4 max-[34rem]:grid-cols-1 max-[34rem]:gap-x-0"
            style={{ '--cols': n } as CSSProperties}
          >
            {cols.map((band, c) => (
              <div key={c} className="flex flex-col">
                {band.via && bracket !== 'merge' && <Connector label={band.via} />}
                <BandBox band={band} />
              </div>
            ))}
          </div>
        </div>
      ))}

      {spans.length > 0 && (
        <div className="mt-7 border-t border-dashed border-[var(--viz-grid)] pt-[1.1rem]">
          <p className="m-0 mb-2 text-[0.6875rem] font-semibold tracking-[0.06em] text-fd-primary uppercase">
            Cross-cutting
          </p>
          {spans.map((band, i) => (
            <div
              key={i}
              className={`rounded-[0.4rem] border border-[var(--viz-grid)] bg-fd-primary/[0.07] px-[0.85rem] py-[0.7rem] ${
                i > 0 ? 'mt-2' : ''
              }`}
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[0.9375rem] leading-[1.3] font-semibold tracking-[-0.01em] text-fd-foreground">
                  {band.label}
                </span>
                {band.part && (
                  <span className="text-[0.6875rem] font-semibold tracking-[0.06em] whitespace-nowrap text-fd-muted-foreground uppercase">
                    {band.part}
                  </span>
                )}
              </div>
              {band.items && <ItemList items={band.items} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

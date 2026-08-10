import type { CSSProperties } from 'react';

interface Rung {
  when: string;
  then: string;
  note?: string;
  tone?: number;
}

interface LadderProps {
  question?: string;
  rungs: Rung[];
}

const RULE = 'color-mix(in oklab, var(--viz-muted) 55%, transparent)';
const toneColor = (tone?: number) => (tone ? `var(--viz-${tone})` : 'var(--viz-muted)');

function Corner({ style, className = '' }: { style: CSSProperties; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute size-[5px] ${className}`}
      style={{ borderTop: `1px solid ${RULE}`, borderInlineEnd: `1px solid ${RULE}`, ...style }}
    />
  );
}

// Below 34rem the condition moves to its own row above, so the arrow no
// longer bridges two side-by-side columns: it turns to point down instead.
function Arrow() {
  return (
    <span
      aria-hidden="true"
      className="relative h-px w-7 flex-none max-[34rem]:mt-[0.1rem] max-[34rem]:h-[1.15rem] max-[34rem]:w-px"
      style={{ background: RULE }}
    >
      <Corner
        className="max-[34rem]:hidden"
        style={{ insetInlineEnd: 0, top: '50%', transform: 'translateY(-50%) rotate(45deg)' }}
      />
      <Corner
        className="hidden max-[34rem]:block"
        style={{ left: '50%', bottom: 0, transform: 'translateX(-50%) rotate(135deg)' }}
      />
    </span>
  );
}

export function Ladder({ question, rungs }: LadderProps) {
  return (
    <div>
      {question && (
        <p className="m-0 mb-1.5 text-[0.9375rem] font-semibold tracking-tight text-fd-primary">{question}</p>
      )}

      <dl className="m-0">
        {rungs.map((rung, i) => {
          const color = toneColor(rung.tone);

          return (
            <div
              key={i}
              className="grid grid-cols-[1fr_auto_minmax(0,13rem)] items-center gap-x-[0.9rem] border-t border-[var(--viz-grid)] py-[0.65rem] max-[34rem]:grid-cols-[auto_1fr] max-[34rem]:items-start max-[34rem]:gap-x-[0.7rem] max-[34rem]:gap-y-0"
            >
              <dt className="m-0 text-sm leading-[1.45] text-fd-foreground max-[34rem]:col-span-2 max-[34rem]:mb-2">
                {rung.when}
              </dt>
              <Arrow />
              <dd
                className="m-0 border-s-2 ps-[0.7rem] text-sm leading-[1.35] font-semibold text-fd-foreground"
                style={{ borderInlineStartColor: color }}
              >
                {rung.then}
                {rung.note && (
                  <span className="block text-[0.8125rem] font-normal text-fd-muted-foreground">{rung.note}</span>
                )}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

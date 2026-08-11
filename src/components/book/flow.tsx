import { Fragment, type CSSProperties } from 'react';

interface Step {
  label: string;
  note?: string;
  tone?: number;
}

interface FlowProps {
  steps: Step[];
  loop?: string;
  mono?: boolean;
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

export function Flow({ steps, loop, mono = false }: FlowProps) {
  return (
    <div>
      <ol className="m-0 flex list-none flex-wrap items-stretch gap-2 p-0 max-[34rem]:flex-col max-[34rem]:items-start max-[34rem]:gap-0">
        {steps.map((step, i) => {
          const color = toneColor(step.tone);

          return (
            <Fragment key={i}>
              {i > 0 && (
                <li
                  aria-hidden="true"
                  className="relative h-px w-8 flex-none self-center max-[34rem]:ms-4 max-[34rem]:h-[1.15rem] max-[34rem]:w-px max-[34rem]:self-start"
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
                </li>
              )}
              <li
                className="flex flex-col justify-center gap-[0.15rem] rounded-[0.35rem] px-[0.7rem] py-[0.4rem]"
                style={{
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: `color-mix(in oklab, ${color} 40%, var(--viz-grid))`,
                  borderBlockEndWidth: '2px',
                  borderBlockEndColor: color,
                  background: `color-mix(in oklab, ${color} 9%, transparent)`,
                }}
              >
                <span
                  className={
                    mono
                      ? 'text-[0.8125rem] font-medium text-fd-foreground'
                      : 'text-sm font-semibold leading-[1.3] text-fd-foreground'
                  }
                >
                  {step.label}
                </span>
                {step.note && (
                  <span className="max-w-[11rem] text-xs leading-[1.35] text-fd-muted-foreground max-[34rem]:max-w-none">
                    {step.note}
                  </span>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>

      {loop && (
        <div className="relative mt-1 h-[2.3rem] max-[34rem]:mt-[0.6rem] max-[34rem]:h-auto max-[34rem]:ps-4">
          <span
            aria-hidden="true"
            className="absolute inset-x-6 top-4 h-px max-[34rem]:hidden"
            style={{ background: RULE }}
          />
          <span
            aria-hidden="true"
            className="absolute top-0 right-6 h-4 w-px max-[34rem]:hidden"
            style={{ background: RULE }}
          />
          <span
            aria-hidden="true"
            className="absolute top-0 left-6 h-4 w-px max-[34rem]:hidden"
            style={{ background: RULE }}
          >
            <Corner style={{ left: '50%', top: 0, transform: 'translateX(-50%) rotate(-45deg)' }} />
          </span>
          <p className="absolute top-[1.35rem] left-1/2 m-0 max-w-[calc(100%-4rem)] -translate-x-1/2 text-center text-[0.6875rem] font-medium text-fd-muted-foreground max-[34rem]:static max-[34rem]:block max-[34rem]:max-w-none max-[34rem]:translate-x-0 max-[34rem]:text-start">
            <span aria-hidden="true" className="hidden max-[34rem]:inline" style={{ color: 'var(--viz-grid)' }}>
              ↑{' '}
            </span>
            {loop}
          </p>
        </div>
      )}
    </div>
  );
}

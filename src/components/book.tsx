import type { ReactNode } from 'react';
import { Callout } from 'fumadocs-ui/components/callout';

const asideVariants = {
  note: { type: 'info', label: 'Note' },
  tip: { type: 'idea', label: 'Tip' },
  caution: { type: 'warn', label: 'Caution' },
  danger: { type: 'error', label: 'Danger' },
} as const;

export function Aside({
  type = 'note',
  title,
  children,
}: {
  type?: keyof typeof asideVariants;
  title?: string;
  children: ReactNode;
}) {
  const variant = asideVariants[type];

  return (
    <Callout type={variant.type} title={title ?? variant.label}>
      {children}
    </Callout>
  );
}

const chipHues = [210, 160, 45, 350, 280];

export function TokenStrip({
  tokens,
  stats = true,
  markSpaces = false,
}: {
  tokens: string[];
  stats?: boolean;
  markSpaces?: boolean;
}) {
  const chars = tokens.join('').length;

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {tokens.map((token, i) => {
          const hue = chipHues[i % chipHues.length];

          return (
            <span
              key={i}
              className="inline-flex items-baseline gap-1.5 rounded border px-1.5 py-1"
              style={{
                borderColor: `hsl(${hue} 70% 50% / 0.55)`,
                background: `hsl(${hue} 70% 50% / 0.15)`,
              }}
            >
              <span className="font-mono text-sm whitespace-pre">
                {markSpaces ? token.replaceAll(' ', '␣') : token}
              </span>
              <span className="text-[0.65rem]" style={{ color: `hsl(${hue} 70% 45%)` }}>
                {i + 1}
              </span>
            </span>
          );
        })}
      </div>
      {stats && (
        <p className="mt-3.5 text-sm text-fd-muted-foreground">
          <strong>{tokens.length}</strong> tokens · <strong>{chars}</strong> characters ·{' '}
          {(chars / tokens.length).toFixed(2)} chars per token
        </p>
      )}
    </div>
  );
}

export function Figure({
  caption,
  frame = true,
  children,
}: {
  caption?: string;
  frame?: boolean;
  children: ReactNode;
}) {
  return (
    <figure className="my-8">
      <div className={frame ? 'overflow-x-auto rounded-lg border bg-fd-card p-5' : 'overflow-x-auto'}>
        {children}
      </div>
      {caption && (
        <figcaption className="mt-3 border-s-2 border-fd-primary ps-3 text-sm text-fd-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

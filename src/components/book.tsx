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

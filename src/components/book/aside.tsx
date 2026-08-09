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

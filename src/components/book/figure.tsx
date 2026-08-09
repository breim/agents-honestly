import type { ReactNode } from 'react';

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

import { FlaskConical } from 'lucide-react';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import { cn } from '@/lib/cn';
import { labFor, type LabTier } from '@/lib/labs';

const TIER_HINT: Record<LabTier, string> = {
  build: 'Build — advances the running Atlas system',
  drill: 'Drill — a self-contained technique',
  micro: 'Micro — one pattern, one property',
};

/** Absent on the chapters that are an argument rather than a thing to build, which is the
    honest signal: a link here means there is something to run. */
export function LabLink({ slug }: { slug: string }) {
  const lab = labFor(slug);
  if (!lab) return null;

  return (
    <a
      href={lab.url}
      target="_blank"
      rel="noreferrer"
      title={TIER_HINT[lab.tier]}
      /* fumadocs' own button rather than shadcn's, matching what `MarkdownCopyButton` beside
         it resolves to: the shadcn one themes off a different token set and reads as a white
         chip among grey ones in the light theme. */
      className={cn(
        buttonVariants({ color: 'secondary', size: 'sm' }),
        'gap-2 [&_svg]:size-3.5 [&_svg]:text-fd-muted-foreground',
      )}
    >
      <FlaskConical />
      Exercise
    </a>
  );
}

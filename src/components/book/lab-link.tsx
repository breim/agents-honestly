import { FlaskConical } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
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
      className={buttonVariants({ variant: 'outline', size: 'sm' })}
    >
      <FlaskConical />
      Exercise
    </a>
  );
}

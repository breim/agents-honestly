'use client';

import Giscus from '@giscus/react';
import { useTheme } from 'next-themes';
import { discussionsConfig } from '@/lib/shared';

/** Renders the Giscus comment widget at the bottom of each chapter. The component is designed
    to be loaded via `next/dynamic` with `ssr: false` so the iframe is never part of the
    server-rendered HTML and the Giscus bundle stays out of the initial page load. */
export function Comments() {
  const { resolvedTheme } = useTheme();

  return (
    <Giscus
      repo={`${discussionsConfig.user}/${discussionsConfig.repo}`}
      repoId={discussionsConfig.repoId}
      category={discussionsConfig.category}
      categoryId={discussionsConfig.categoryId}
      mapping="pathname"
      strict="1"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="top"
      theme={resolvedTheme === 'dark' ? 'transparent_dark' : 'light'}
      lang="en"
      loading="lazy"
    />
  );
}

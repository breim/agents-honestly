'use client';

import { useEffect, useRef } from 'react';
import { markRead } from '@/lib/read-progress';

/** Sits at the end of the chapter body: once its sentinel is on screen the reader has the last
    paragraph in view, which is the closest thing to "read this" that needs no click. A chapter
    short enough to fit the viewport marks on arrival, which is the same claim. */
export function ReadMarker({ url }: { url: string }) {
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = sentinel.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) markRead(url);
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [url]);

  return <div ref={sentinel} aria-hidden />;
}

'use client';

import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'book:read';

const listeners = new Set<() => void>();
let cache: Set<string> | null = null;

function readUrls(): Set<string> {
  if (!cache) {
    try {
      cache = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'));
    } catch {
      cache = new Set();
    }
  }

  return cache;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function markRead(url: string) {
  const urls = readUrls();
  if (urls.has(url)) return;

  urls.add(url);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...urls]));
  listeners.forEach((listener) => listener());
}

/** The server has no storage to read, so the snapshot it renders is always "unread" and the
    mark appears on the client pass. Returning anything else here is a hydration mismatch. */
export function useIsRead(url: string) {
  return useSyncExternalStore(
    subscribe,
    () => readUrls().has(url),
    () => false,
  );
}

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { source } from '@/lib/source';
import { appName, appTagline, docsRoute, githubUrl } from '@/lib/shared';

export default function HomePage() {
  const pages = source.getPages();

  return (
    <main className="flex-1">
      <section className="mx-auto flex max-w-3xl flex-col items-center px-6 pt-24 pb-20 text-center sm:pt-32 sm:pb-28">
        <h1 className="animate-reveal text-display text-balance">{appName}</h1>
        <p className="animate-reveal mt-6 max-w-xl text-body text-fd-muted-foreground text-pretty [animation-delay:70ms]">
          {appTagline}
        </p>
        <div className="animate-reveal mt-10 flex flex-wrap items-center justify-center gap-3 [animation-delay:140ms]">
          <Link
            href={docsRoute}
            className="pressable inline-flex h-11 items-center rounded-full bg-fd-primary px-6 text-sm font-medium text-fd-primary-foreground hover:bg-fd-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-ring"
          >
            Read the docs
          </Link>
          <a
            href={githubUrl}
            rel="noreferrer noopener"
            className="pressable inline-flex h-11 items-center rounded-full border bg-fd-card px-6 text-sm font-medium hover:border-fd-foreground/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-ring"
          >
            View on GitHub
          </a>
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-6 pb-28">
        <h2 className="text-caption font-medium text-fd-muted-foreground">In the docs</h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {pages.map((page) => (
            <li key={page.url} className="reveal-on-view">
              <Link
                href={page.url}
                className="pressable group flex h-full flex-col rounded-2xl border bg-fd-card p-5 text-start hover:border-fd-foreground/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-ring"
              >
                <h3 className="text-headline">{page.data.title}</h3>
                {page.data.description && (
                  <p className="mt-1.5 text-caption text-fd-muted-foreground">
                    {page.data.description}
                  </p>
                )}
                <ArrowRight className="mt-auto pt-6 size-4 box-content text-fd-muted-foreground transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

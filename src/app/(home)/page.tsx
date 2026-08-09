import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { appName, appTagline, docsRoute, githubUrl } from '@/lib/shared';
import { BayerWash } from '@/components/bayer-wash';
import {
  answerRoutes,
  arc,
  atlasForces,
  catalogCategories,
  catalogShape,
  counts,
  exclusions,
  openingQuestions,
  productionAgent,
  startHere,
  stateLadder,
  tutorialAgent,
} from '@/lib/landing-content';

export const metadata: Metadata = {
  title: appName,
  description: appTagline,
};

const primaryAction =
  'pressable inline-flex h-11 items-center rounded-full bg-fd-primary px-6 text-sm font-medium text-fd-primary-foreground hover:bg-fd-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-ring';
const secondaryAction =
  'pressable inline-flex h-11 items-center rounded-full border bg-fd-card px-6 text-sm font-medium hover:border-fd-foreground/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-ring';
const panel = 'rounded-2xl border bg-fd-card';

function Section({
  label,
  heading,
  lead,
  children,
}: {
  label: string;
  heading: string;
  lead: string;
  children: ReactNode;
}) {
  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-16 sm:py-20">
      <div className="reveal-on-view">
        <p className="text-caption font-medium text-fd-muted-foreground">{label}</p>
        <h2 className="mt-3 text-title text-balance">{heading}</h2>
        <p className="mt-4 text-body text-fd-muted-foreground text-pretty">{lead}</p>
      </div>
      {children}
    </section>
  );
}

export default function HomePage() {
  return (
    <main className="flex-1">
      <section className="relative isolate overflow-hidden px-6 pt-24 pb-16 sm:pt-32 sm:pb-20">
        <BayerWash />
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <p className="animate-reveal text-caption font-medium text-fd-muted-foreground">
            {appName}
          </p>
          <h1 className="animate-reveal mt-5 text-display text-balance [animation-delay:60ms]">
            Building an agent is easy.
          </h1>
          <p className="animate-reveal mt-4 max-w-2xl text-title font-normal text-fd-muted-foreground text-balance [animation-delay:120ms]">
            Building an agentic system a company can depend on is software engineering.
          </p>
          <p className="animate-reveal mt-7 max-w-xl text-body text-pretty [animation-delay:180ms]">
            {appTagline} The failure modes are old — they come from retrieval, durable execution,
            distributed transactions and authorization. What changes is that a nondeterministic,
            expensive, occasionally-wrong component now sits in the middle.
          </p>
          <div className="animate-reveal mt-9 flex flex-wrap items-center justify-center gap-3 [animation-delay:240ms]">
            <Link href={`${docsRoute}/preface`} className={primaryAction}>
              Start reading
            </Link>
            <Link href={`${docsRoute}/core-path`} className={secondaryAction}>
              The core path
            </Link>
          </div>
          <p className="animate-reveal mt-7 text-caption text-fd-muted-foreground [animation-delay:300ms]">
            214 chapters · every sample in TypeScript and Python
          </p>
        </div>

        <ul className="animate-reveal mx-auto mt-16 grid max-w-4xl gap-4 text-start [animation-delay:360ms] sm:grid-cols-3">
          {openingQuestions.map(({ question, answer }) => (
            <li key={question} className={`${panel} p-5`}>
              <p className="text-headline text-balance">{question}</p>
              <p className="mt-2 text-caption text-fd-muted-foreground text-pretty">{answer}</p>
            </li>
          ))}
        </ul>
      </section>

      <Section
        label="The gap"
        heading="There is a lot of material on building an agent. Very little on running one."
        lead="A tutorial agent and a production agent share a name and almost nothing else. The techniques that close the distance are mostly not new — the agent ecosystem is rediscovering them one incident at a time."
      >
        <div className="reveal-on-view mt-8 grid gap-4 sm:grid-cols-2">
          {[
            { label: 'A tutorial agent', items: tutorialAgent, muted: true },
            { label: 'A production agent', items: productionAgent, muted: false },
          ].map(({ label, items, muted }) => (
            <div key={label} className={`${panel} p-6`}>
              <h3 className="text-headline">{label}</h3>
              <ul className="mt-4 space-y-2.5">
                {items.map((item) => (
                  <li
                    key={item}
                    className={`flex gap-2.5 text-caption text-pretty ${muted ? 'text-fd-muted-foreground' : ''}`}
                  >
                    <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-current" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section
        label="The one mistake"
        heading="Almost every architectural mistake is the same mistake."
        lead="State held by the wrong layer. Business state in the graph dies with the worker. Facts in the context window mean the agent is confidently reasoning from a stale copy. Decisions in the workflow make a deterministic engine responsible for judgment, and the first replay will disagree with itself."
      >
        <dl className={`reveal-on-view mt-8 divide-y ${panel}`}>
          {stateLadder.map(([signal, owner]) => (
            <div key={owner} className="flex flex-col gap-1 p-5 sm:flex-row sm:items-baseline sm:gap-6">
              <dt className="flex-1 text-caption text-fd-muted-foreground text-pretty">{signal}</dt>
              <dd className="text-caption font-medium">{owner}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section
        label="Before the architecture"
        heading="Where does the answer live?"
        lead="Asked once per piece of information the agent needs. Read the rows as ingredients, not as a routing switch — most real questions need two or three at once, and an architecture that assumes one route per question will bend every question toward the path it happens to have."
      >
        <ul className={`reveal-on-view mt-8 divide-y ${panel}`}>
          {answerRoutes.map(([sounds, reach, because]) => (
            <li key={reach} className="grid gap-1 p-5 sm:grid-cols-[1fr_auto] sm:gap-6">
              <div>
                <p className="text-caption font-medium text-pretty">{sounds}</p>
                <p className="mt-1 text-caption text-fd-muted-foreground text-pretty">{because}</p>
              </div>
              <p className="text-caption text-fd-muted-foreground sm:text-end">{reach}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        label="The running project"
        heading="You build one system, three times."
        lead="Atlas is an internal agent for a fictional company. It answers questions across systems that were never designed to be queried together, and it takes actions with consequences. First with no framework, so you know what the loop is. Then as an explicit graph, so you can see what the abstraction buys. Then on durable execution, so it survives being real."
      >
        <dl className={`reveal-on-view mt-8 divide-y ${panel}`}>
          {atlasForces.map(([demand, forces]) => (
            <div key={demand} className="grid gap-1 p-5 sm:grid-cols-2 sm:gap-6">
              <dt className="text-caption font-medium text-pretty">{demand}</dt>
              <dd className="text-caption text-fd-muted-foreground text-pretty">{forces}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section
        label="How it is organized"
        heading="Two books sharing a table of contents."
        lead="Parts I–XX are a narrative: each assumes the ones before it, and Atlas accumulates across all of them. Part XXI is a catalog you consult when you have the problem it names — reading it end to end is possible and not especially useful."
      >
        <ul className="reveal-on-view mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-fd-border sm:grid-cols-4">
          {counts.map(([value, label]) => (
            <li key={label} className="bg-fd-card p-5">
              <p className="text-title tabular-nums">{value}</p>
              <p className="mt-1 text-caption text-fd-muted-foreground">{label}</p>
            </li>
          ))}
        </ul>

        <ol className={`reveal-on-view mt-4 divide-y ${panel}`}>
          {arc.map(([parts, title, outcome]) => (
            <li key={parts} className="grid gap-1 p-5 sm:grid-cols-[5rem_1fr] sm:gap-6">
              <span className="text-caption font-medium text-fd-muted-foreground tabular-nums">
                {parts}
              </span>
              <div>
                <p className="text-caption font-medium">{title}</p>
                <p className="mt-1 text-caption text-fd-muted-foreground text-pretty">{outcome}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className={`reveal-on-view mt-4 ${panel} p-6`}>
          <h3 className="text-headline">The catalog</h3>
          <ul className="mt-4 flex flex-wrap gap-2">
            {catalogCategories.map((category) => (
              <li
                key={category}
                className="rounded-full border px-3 py-1 text-caption text-fd-muted-foreground"
              >
                {category}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-caption text-fd-muted-foreground text-pretty">
            Sixty-six entries, each self-contained and written to the same shape:
          </p>
          <p className="mt-2 text-caption font-medium text-pretty">{catalogShape.join(' · ')}</p>
        </div>
      </Section>

      <Section
        label="Who this is for"
        heading="You write software. You have called an LLM API at least once."
        lead="You do not need an ML background — not because this is ML made easy, but because it is a different job. Making a system behave when a model you did not train, cannot inspect and do not control sits in the middle of it. What you need is comfort with a typed language, an HTTP API, SQL, and the idea that a system can fail halfway through."
      >
        <ul className="reveal-on-view mt-8 space-y-3">
          {exclusions.map(([claim, detail]) => (
            <li key={claim} className={`${panel} p-5`}>
              <p className="text-caption font-medium">{claim}</p>
              <p className="mt-1 text-caption text-fd-muted-foreground text-pretty">{detail}</p>
            </li>
          ))}
        </ul>
      </Section>

      <section className="mx-auto w-full max-w-3xl px-6 py-16 sm:py-20">
        <div className="reveal-on-view">
          <p className="text-caption font-medium text-fd-muted-foreground">Start here</p>
          <h2 className="mt-3 text-title text-balance">Five chapters before the build begins.</h2>
        </div>

        <ul className="reveal-on-view mt-8 grid gap-3 sm:grid-cols-2">
          {startHere.map(([slug, title, summary], i) => (
            <li key={slug} className={i === 0 ? 'sm:col-span-2' : undefined}>
              <Link
                href={`${docsRoute}/${slug}`}
                className={`pressable group flex h-full flex-col ${panel} p-5 hover:border-fd-foreground/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-ring`}
              >
                <h3 className="text-headline text-balance">{title}</h3>
                <p className="mt-1.5 text-caption text-fd-muted-foreground text-pretty">
                  {summary}
                </p>
                <ArrowRight
                  aria-hidden
                  className="mt-auto pt-5 size-4 box-content text-fd-muted-foreground transition-transform duration-200 ease-out group-hover:translate-x-0.5"
                />
              </Link>
            </li>
          ))}
        </ul>

        <div
          className={`reveal-on-view mt-12 flex flex-col items-center ${panel} px-6 py-14 text-center`}
        >
          <h2 className="text-title text-balance">Start with the preface.</h2>
          <p className="mt-4 max-w-md text-caption text-fd-muted-foreground text-pretty">
            Or take the core path — 49 chapters that get you to something you can ship and defend.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href={`${docsRoute}/preface`} className={primaryAction}>
              Start reading
            </Link>
            <a href={githubUrl} rel="noreferrer noopener" className={secondaryAction}>
              View on GitHub
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

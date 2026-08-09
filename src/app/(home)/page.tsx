import type { Metadata } from 'next';
import Link from 'next/link';
import { appName, appTagline, docsRoute, githubUrl } from '@/lib/shared';
import { BayerWash } from '@/components/bayer-wash';

export const metadata: Metadata = {
  title: appName,
  description: appTagline,
};

const tutorialAgent = [
  'lives inside a single process',
  'runs for a few seconds',
  'serves one cooperative user',
  'spends a budget nobody measures',
  'reads data nobody guards',
];

const productionAgent = [
  'lives across deploys',
  'gets interrupted, and waits days for a human',
  'runs a thousand times in parallel against a provider that throttles you',
  'reads documents an attacker may have written',
  'spends real money on every retry',
];

const atlasForces = [
  ['Answer "what is our policy on…"', 'Retrieval, chunking, grounding, citations'],
  ['Answer "how much did we sell in Spain in Q2"', 'That this is SQL, not retrieval'],
  ['Never show one tenant another tenant’s documents', 'Metadata filtering as an authorization boundary'],
  ['Ignore instructions hidden inside a document', 'That retrieved text is untrusted input'],
  ['Issue a refund, then email the customer', 'Compensating a side effect when step two fails'],
  ['Wait days for a customer to reply', 'State that outlives every process and deploy'],
];

const arc = [
  ['I–II', 'The model, and the loop', 'You can build an agent with no framework and explain every line'],
  ['III–V', 'Context, retrieval, knowledge', 'You know where an answer lives before you go looking for it'],
  ['VI–IX', 'Workflows, graphs, tools, MCP', 'You can decide what should be an agent and choose the right remote boundary'],
  ['X–XII', 'Durable execution, humans', 'It survives crashes, deploys, and a three-day wait for approval'],
  ['XIII', 'Interface', 'People can use it across ability, language and voice, and trust what they see'],
  ['XIV–XVII', 'Evals, tracing, reliability, security', 'You can prove it works and defend it when it is attacked'],
  ['XVIII–XX', 'Production, governance, multi-agent', 'You can run it, introduce it into real work, and know when to stop'],
];

const counts = [
  ['23', 'parts'],
  ['214', 'chapters'],
  ['66', 'catalog entries'],
  ['49', 'on the core path'],
];

const exclusions = [
  ['Not a framework manual.', 'Those docs exist and are better. This covers what they assume you already know.'],
  ['Not prompt engineering.', 'Only the parts that generalize. The rest belongs in a blog post with a date on it.'],
  ['Not machine learning.', 'Nothing here trains a model. Evals borrow the measurement discipline, not the gradients.'],
];

const sectionHeading = 'text-3xl tracking-tight font-semibold text-balance sm:text-4xl';
const sectionLabel = 'text-caption font-medium text-fd-muted-foreground';

export default function HomePage() {
  return (
    <main className="flex-1">
      <section className="relative isolate overflow-hidden px-6 pt-24 pb-24 sm:pt-32 sm:pb-32">
        <BayerWash />
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <p className="animate-reveal text-caption font-medium text-fd-muted-foreground">
            {appTagline}
          </p>
          <h1 className="animate-reveal mt-5 text-display text-balance [animation-delay:60ms]">
            {appName}
          </h1>
          <p className="animate-reveal mt-6 max-w-xl text-body text-pretty [animation-delay:120ms]">
            Building an agent is easy. Building an agentic system a company can depend on is
            software engineering.
          </p>
          <div className="animate-reveal mt-10 flex flex-wrap items-center justify-center gap-3 [animation-delay:180ms]">
            <Link
              href={`${docsRoute}/preface`}
              className="pressable inline-flex h-11 items-center rounded-full bg-fd-primary px-6 text-sm font-medium text-fd-primary-foreground hover:bg-fd-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-ring"
            >
              Start reading
            </Link>
            <Link
              href={`${docsRoute}/core-path`}
              className="pressable inline-flex h-11 items-center rounded-full border bg-fd-card px-6 text-sm font-medium hover:border-fd-foreground/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-ring"
            >
              The core path
            </Link>
          </div>
          <p className="animate-reveal mt-8 text-caption text-fd-muted-foreground [animation-delay:240ms]">
            Every sample in TypeScript and Python
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-6 pb-28">
        <div className="reveal-on-view">
          <h2 className={sectionHeading}>
            There is a lot of material on building an agent. Very little on running one.
          </h2>
          <p className="mt-5 text-body text-fd-muted-foreground text-pretty">
            The gap is not subtle. The techniques that close it are mostly not new — they come from
            information retrieval, durable execution, distributed transactions, authorization and
            testing methodology, and the agent ecosystem is rediscovering them one incident at a
            time.
          </p>
        </div>

        <div className="reveal-on-view mt-10 grid gap-4 sm:grid-cols-2">
          {[
            { label: 'A tutorial agent', items: tutorialAgent, muted: true },
            { label: 'A production agent', items: productionAgent, muted: false },
          ].map(({ label, items, muted }) => (
            <div key={label} className="rounded-2xl border bg-fd-card p-6">
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
      </section>

      <section className="mx-auto w-full max-w-3xl px-6 pb-28">
        <div className="reveal-on-view">
          <p className={sectionLabel}>The running project</p>
          <h2 className={`${sectionHeading} mt-3`}>You build one system, three times.</h2>
          <p className="mt-5 text-body text-fd-muted-foreground text-pretty">
            Atlas is an internal agent for a fictional company. It answers questions across systems
            that were never designed to be queried together, and it takes actions with consequences
            — under a policy, with approval where the blast radius warrants it. First with no
            framework, so you know what the loop is. Then as an explicit graph. Then on durable
            execution, so it survives being real.
          </p>
        </div>

        <dl className="reveal-on-view mt-10 divide-y rounded-2xl border bg-fd-card">
          {atlasForces.map(([demand, forces]) => (
            <div key={demand} className="grid gap-1 p-5 sm:grid-cols-2 sm:gap-6">
              <dt className="text-caption font-medium text-pretty">{demand}</dt>
              <dd className="text-caption text-fd-muted-foreground text-pretty">{forces}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto w-full max-w-3xl px-6 pb-28">
        <div className="reveal-on-view">
          <p className={sectionLabel}>How it is organized</p>
          <h2 className={`${sectionHeading} mt-3`}>Two books sharing a table of contents.</h2>
          <p className="mt-5 text-body text-fd-muted-foreground text-pretty">
            Parts I–XX are a narrative: each assumes the ones before it, and Atlas accumulates
            across all of them. Part XXI is a catalog you consult when you have the problem it
            names — reading it end to end is possible and not especially useful.
          </p>
        </div>

        <ul className="reveal-on-view mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-fd-border sm:grid-cols-4">
          {counts.map(([value, label]) => (
            <li key={label} className="bg-fd-card p-5">
              <p className="text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
              <p className="mt-1 text-caption text-fd-muted-foreground">{label}</p>
            </li>
          ))}
        </ul>

        <ol className="reveal-on-view mt-4 divide-y rounded-2xl border bg-fd-card">
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
      </section>

      <section className="mx-auto w-full max-w-3xl px-6 pb-28">
        <div className="reveal-on-view">
          <p className={sectionLabel}>Who this is for</p>
          <h2 className={`${sectionHeading} mt-3`}>
            You write software. You have called an LLM API at least once.
          </h2>
          <p className="mt-5 text-body text-fd-muted-foreground text-pretty">
            You do not need an ML background — not because this is ML made easy, but because it is a
            different job. Making a system behave when a model you did not train, cannot inspect and
            do not control sits in the middle of it. What you need is comfort with a typed language,
            an HTTP API, SQL, and the idea that a system can fail halfway through.
          </p>
        </div>

        <ul className="reveal-on-view mt-10 space-y-3">
          {exclusions.map(([claim, detail]) => (
            <li key={claim} className="rounded-2xl border bg-fd-card p-5">
              <p className="text-caption font-medium">{claim}</p>
              <p className="mt-1 text-caption text-fd-muted-foreground text-pretty">{detail}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto w-full max-w-3xl px-6 pb-32">
        <div className="reveal-on-view flex flex-col items-center rounded-2xl border bg-fd-card px-6 py-14 text-center">
          <h2 className={sectionHeading}>Start with the preface.</h2>
          <p className="mt-4 max-w-md text-caption text-fd-muted-foreground text-pretty">
            Or take the core path — 49 chapters that get you to something you can ship and defend.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={`${docsRoute}/preface`}
              className="pressable inline-flex h-11 items-center rounded-full bg-fd-primary px-6 text-sm font-medium text-fd-primary-foreground hover:bg-fd-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-ring"
            >
              Start reading
            </Link>
            <a
              href={githubUrl}
              rel="noreferrer noopener"
              className="pressable inline-flex h-11 items-center rounded-full border px-6 text-sm font-medium hover:border-fd-foreground/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-ring"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

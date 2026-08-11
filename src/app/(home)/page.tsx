import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getParts, type Part } from '@/lib/contents';
import { readerRequirements } from '@/lib/landing-content';
import { appName, authorName, authorUrl, docsRoute, githubUrl } from '@/lib/shared';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: `${appName}. A free handbook for agentic systems in production`,
  description:
    'Building an agent is easy. Building one that survives production is software engineering. Free to read in full, no signup, nothing for sale.',
};

const prefaceHref = `${docsRoute}/preface`;
const mapHref = `${docsRoute}/the-map`;

const rise = (order: number) => ({ '--i': order }) as React.CSSProperties;

function Section({
  children,
  lede,
  title,
}: {
  children?: React.ReactNode;
  lede?: string;
  title: string;
}) {
  return (
    <section>
      <div className="mx-auto w-full max-w-5xl px-6 py-20 sm:py-28">
        <h2 className="max-w-[24ch] text-title text-balance">{title}</h2>
        {lede ? (
          <p className="mt-5 max-w-[68ch] text-body text-muted-foreground text-pretty">{lede}</p>
        ) : null}
        {children}
      </div>
    </section>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Decorative, so it carries no alt text. Left unoptimized on purpose: the source is
          already one bit, and re-encoding a dither through a lossy codec turns the ordered
          pattern into grey mush. */}
      <Image
        alt=""
        aria-hidden
        className="absolute inset-0 size-full object-cover"
        height={1280}
        priority
        sizes="100vw"
        src="/hero-dither.webp"
        unoptimized
        width={1920}
      />
      <div aria-hidden className="landing-scrim absolute inset-0" />
      <div className="relative mx-auto w-full max-w-5xl px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <Badge className="landing-rise h-7 px-3 text-caption" style={rise(0)} variant="outline">
          A free book · no signup · nothing for sale
        </Badge>
        <h1 className="landing-rise mt-7 max-w-[18ch] text-display text-balance" style={rise(1)}>
          Building an agent is easy.
        </h1>
        <p
          className="landing-rise mt-3 max-w-[22ch] text-lede text-muted-foreground text-balance"
          style={rise(2)}
        >
          Building one that survives production is software engineering.
        </p>
        <p
          className="landing-rise mt-8 max-w-[62ch] text-body text-muted-foreground text-pretty"
          style={rise(3)}
        >
          A handbook that starts at one API call and ends with a system that survives crashes, waits
          three days for a human without holding a thread open, and treats every document it reads
          as written by an attacker. You do not need to have built an agent before. The prerequisite
          is the backend engineering you already have.
        </p>
        <div className="landing-rise mt-9 flex flex-wrap items-center gap-3" style={rise(4)}>
          <Link
            className={cn(buttonVariants({ size: 'lg' }), 'h-12 px-6 text-note')}
            href={prefaceHref}
          >
            Start reading
            <ArrowRight aria-hidden />
          </Link>
          <Link
            className={cn(buttonVariants({ size: 'lg', variant: 'ghost' }), 'h-12 px-5 text-note')}
            href={mapHref}
          >
            See the map first
          </Link>
        </div>
        <p
          className="landing-rise mt-7 max-w-[58ch] text-note text-muted-foreground"
          style={rise(5)}
        >
          Read the whole book in the browser, free. Really. No email gate, no account, no course
          waiting for you at the end.
        </p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-8 px-6 py-4">
        <p className="text-note text-muted-foreground">{appName}</p>
        <a className="landing-quiet-link" href={authorUrl} rel="noreferrer" target="_blank">
          {authorName}
        </a>
      </div>
    </footer>
  );
}

const exclusions = [
  {
    detail:
      'LangChain, LangGraph, Temporal and the AI SDK all have documentation, and it is better than anything a book could reproduce. This covers what those docs assume you already know.',
    title: 'Not a framework manual',
  },
  {
    detail:
      'What generalizes is here. How tokens and context work, how tool schemas shape behavior, why your agent is nondeterministic. What expires the week a new model ships is not.',
    title: 'Not prompt engineering',
  },
  {
    detail:
      'Nothing here trains a model. You will choose models, embeddings and rerankers, and decide when a fine-tune is the right answer. That is an engineering call, not a training run.',
    title: 'Not machine learning',
  },
  {
    detail:
      'Multi-agent architectures are usually a mistake. Most RAG pipelines should have been a tool call. A lot of what gets called an agent should be three if-statements. You are free to disagree.',
    title: 'Not neutral',
  },
];

function ContentsGroup({ heading, parts }: { heading: string; parts: Part[] }) {
  return (
    <div className="mt-10">
      <p className="text-caption tracking-widest text-muted-foreground">{heading}</p>
      <Accordion className="mt-2 border-t">
        {parts.map((part) => (
          <AccordionItem key={part.url} value={part.url}>
            <AccordionTrigger className="gap-6 py-4">
              <span className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-3">
                {part.label ? (
                  <span className="text-caption text-muted-foreground">{part.label}</span>
                ) : null}
                <span className="text-headline">{part.title}</span>
              </span>
              <span className="mt-1 shrink-0 pr-3 text-caption tabular-nums text-muted-foreground">
                {part.chapters.length}
              </span>
            </AccordionTrigger>
            <AccordionContent className="[&_a]:no-underline">
              <ul className="grid gap-x-10 gap-y-2 pb-4 sm:grid-cols-2">
                {part.chapters.map((chapter) => (
                  <li key={chapter.url}>
                    <Link
                      className="text-note text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                      href={chapter.url}
                    >
                      {chapter.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

export default function HomePage() {
  const parts = getParts();
  const narrative = parts.filter((part) => !part.reference);
  const reference = parts.filter((part) => part.reference);
  const chapterCount = parts.reduce((total, part) => total + part.chapters.length, 0);

  return (
    <main className="landing flex-1">
      <Hero />

      <Section
        lede="You write software. You may have called an LLM API, you may not have. Either way you have not built an agent yet, and the word itself still covers a chatbot with a good system prompt, a script that calls an API twice, and a fictional colleague that will allegedly run your company."
        title="Who this is for"
      >
        <p className="mt-6 max-w-[68ch] text-body text-muted-foreground text-pretty">
          You do not need a machine-learning background, and not because this is ML made easy. It is
          a different job. ML engineering makes a model behave. This is the work of making a{' '}
          <em>system</em> behave, with a model you did not train, cannot inspect and do not control
          sitting in the middle of it.
        </p>
        <ul className="mt-8 flex flex-wrap gap-2">
          {readerRequirements.map((requirement) => (
            <li key={requirement}>
              <Badge className="h-7 px-3 text-note font-normal" variant="outline">
                {requirement}
              </Badge>
            </li>
          ))}
        </ul>
      </Section>
      <Section title="What this book is not">
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {exclusions.map((exclusion) => (
            <Card key={exclusion.title}>
              <CardHeader>
                <CardTitle className="text-headline">{exclusion.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-note text-muted-foreground text-pretty">
                {exclusion.detail}
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>
      <Section
        lede={`${parts.length} parts, ${chapterCount} chapters. The first half makes you do retrieval engineering properly. Knowing when a question is semantic, when it is lexical, when it is SQL, and when the index is a stale copy of a live system. The second half does the same for durability.`}
        title="Everything in the book"
      >
        <ContentsGroup heading="Read in order" parts={narrative} />
        <ContentsGroup heading="Consulted as needed" parts={reference} />
      </Section>
      <Section
        lede="It takes about ten minutes and tells you whether the rest is worth your time. Nothing is gated. Nothing is for sale."
        title="Start at the preface."
      >
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Link
            className={cn(buttonVariants({ size: 'lg' }), 'h-12 px-6 text-note')}
            href={prefaceHref}
          >
            Start reading
            <ArrowRight aria-hidden />
          </Link>
          <a
            className={cn(buttonVariants({ size: 'lg', variant: 'outline' }), 'h-12 px-5 text-note')}
            href={githubUrl}
            rel="noreferrer"
            target="_blank"
          >
            Source on GitHub
          </a>
        </div>
      </Section>
      <Footer />
    </main>
  );
}

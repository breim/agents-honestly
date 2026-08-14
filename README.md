# Agents, Honestly

A free handbook for building agentic systems in production. Read it at
**[agentshonestly.com](https://agentshonestly.com)**.

This repository holds the book's text and the site that renders it.

## What the book is

You can get an agent working in an afternoon: a model, three tools, a `while` loop. Then it
meets a week of reality. The provider returns a 503 halfway through a fourteen-step task and
the work evaporates. A conversation reaches turn forty and each message costs thirty times
the first. Someone deploys while two hundred runs are in flight. The agent issues a refund,
then fails before sending the confirmation, and the ledger disagrees with the inbox.

None of those are AI problems. They are context, state, idempotency, retries, authorization,
evaluation and observability problems wearing an AI hat.

> Building an agent is easy. Building an agentic system a company can depend on is software
> engineering.

214 chapters across 23 sections — Start Here, twenty-one numbered parts, and the appendices —
running from a single API call through retrieval, tool design, durable execution, evals,
observability, security and organizational rollout.

It assumes you write software. It does not assume an ML background: making a *system* behave
when a model you did not train sits in the middle of it is a different job, not ML made easy.

## Exercises

Chapters that build something link to an exercise in the companion repository,
[atlas-from-agents-honestly](https://github.com/breim/atlas-from-agents-honestly). Together
they add up to Atlas, one support agent carried from an eighty-line loop to something that
survives production.

That repository owns which chapters have an exercise and what kind. `bun run sync:labs`
copies its answer into `src/lib/labs.ts` rather than leaving links to rot by hand; pass
`--check` to fail on drift instead of writing.

## Layout

| Path | What lives there |
| --- | --- |
| `content/docs/` | The book. One `.mdx` per chapter, one directory per part. |
| `content/docs/*/meta.json` | Sidebar titles and chapter order — see below. |
| `src/app/book/` | The chapter route and layout. |
| `src/app/(home)/` | The landing page. |
| `src/components/book/` | Components the chapters use: `Figure`, `Aside`, `Decision`, `Flow`, `Ladder`, `Layers`, `ContextBudget`, `FrameworkCheck`, `TokenStrip`, `TurnGrowth`. |
| `src/lib/source.ts` | The fumadocs content source. |
| `scripts/sync-labs.mjs` | Regenerates `src/lib/labs.ts` from the exercise repository. |

## Running it

```bash
bun install
bun dev
```

Then open <http://localhost:3000>.

| Script | |
| --- | --- |
| `bun dev` | Development server |
| `bun run build` | Production build |
| `bun run types:check` | `next typegen` and `tsc --noEmit` |
| `bun run lint` | ESLint |
| `bun run sync:labs` | Regenerate `src/lib/labs.ts` |

## Contributing

Corrections are welcome and easy to accept: typos, broken links, code that does not run, a
claim that no longer matches what a provider does. Open an issue or send a pull request
against the chapter's `.mdx`.

Rewrites of a chapter's argument are a harder sell. The book takes positions on purpose, and
one you disagree with is worth an issue before it is worth a patch.

Before sending a pull request:

- `bun run types:check` and `bun run lint` both pass.
- Everything is in English — prose, identifiers, commit messages.
- Commits follow [Conventional Commits](https://www.conventionalcommits.org/), e.g.
  `fix(book): correct the retry bound in idempotency`.

**The sidebar comes from `meta.json`, never from the filesystem.** Every chapter is already
listed in its part's `meta.json`, including ones not yet written — fumadocs silently skips
entries whose file is absent, so a new chapter appears in its correct slot the moment the
file exists, with no other change. A chapter showing up in the wrong place means a
`meta.json` entry is missing or misspelled: fix the entry, not the filename. Filenames match
the book's slugs so cross-chapter links keep resolving.

## License

Two licenses, because this repository holds two different kinds of work. Both require credit.

- **The book** — everything under `content/` — is licensed
  [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Copy it, quote it, translate it,
  teach from it, build on it, commercially or not, as long as you credit Henrique Breim, link
  the license, and note any changes you made. See [LICENSE-CONTENT](LICENSE-CONTENT).
- **The site** — everything else — is [MIT](LICENSE).

© 2026 Henrique Breim.

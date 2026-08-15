import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

export { appTagline, authorName, githubUrl, siteUrl } from '../../src/lib/shared.ts';

export const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

const content = join(root, 'content/docs');

const readMeta = (dir) => {
  const file = join(dir, 'meta.json');

  return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : null;
};

export function readChapterFile(file) {
  const raw = readFileSync(file, 'utf8');
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);

  return {
    data: match ? yaml.load(match[1]) : {},
    source: match ? raw.slice(match[0].length) : raw,
  };
}

/** Fumadocs strips parenthesised directories when it builds a slug, so `(start-here)`
    groups the preface in the sidebar without appearing in `/book/preface`. */
const urlSegments = (segments) =>
  segments.filter((segment) => !(segment.startsWith('(') && segment.endsWith(')')));

function chapterNode(file, segments) {
  const { data, source } = readChapterFile(file);
  const slugs = urlSegments(segments);
  const isIndex = slugs.length === 1 && slugs[0] === 'index';

  return {
    type: 'chapter',
    description: data.description ?? '',
    id: isIndex ? 'index' : slugs.join('-'),
    source,
    title: data.title ?? slugs.at(-1),
    url: isIndex ? '/book' : `/book/${slugs.join('/')}`,
  };
}

/** The sidebar is `meta.json`, never the filesystem: every chapter of the book is listed
    in its part whether or not it has been ported, and the ones without a file are skipped
    the same way Fumadocs skips them. */
function buildPart(dir, segments, title, skipped) {
  const children = [];

  for (const entry of readMeta(dir)?.pages ?? []) {
    if (entry === '...' || entry.startsWith('---')) continue;

    const file = join(dir, `${entry}.mdx`);
    const subdir = join(dir, entry);

    if (existsSync(file)) children.push(chapterNode(file, [...segments, entry]));
    else if (existsSync(subdir))
      children.push(buildPart(subdir, [...segments, entry], readMeta(subdir)?.title ?? entry, skipped));
    else skipped.push([...segments, entry].join('/'));
  }

  return { type: 'part', title, children };
}

export function readBook() {
  const skipped = [];
  const parts = buildPart(content, [], 'Agents, Honestly', skipped).children;
  const chapters = [];

  const collect = (nodes) => {
    for (const node of nodes) {
      if (node.type === 'chapter') chapters.push(node);
      else collect(node.children);
    }
  };
  collect(parts);

  const byUrl = new Map(chapters.map((chapter) => [chapter.url, chapter.id]));
  byUrl.set('/book/index', 'index');

  return { parts, chapters, skipped, resolve: (url) => byUrl.get(url) };
}

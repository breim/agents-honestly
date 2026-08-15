import GithubSlugger from 'github-slugger';
import { toHtml } from 'hast-util-to-html';
import remarkGfm from 'remark-gfm';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import { siteUrl } from './book.mjs';

const ASIDE_LABELS = { note: 'Note', tip: 'Tip', caution: 'Caution', danger: 'Danger' };

const FRAMEWORK_LABELS = {
  plain: 'Plain code',
  langgraph: 'LangGraph',
  temporal: 'Temporal',
  'ai-sdk': 'AI SDK',
  mcp: 'MCP',
  a2a: 'A2A',
};

const parser = unified().use(remarkParse).use(remarkMdx).use(remarkGfm);
const toHast = unified().use(remarkRehype, { clobberPrefix: '' });

export function escapeText(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function attr(node, name) {
  const found = node.attributes?.find((a) => a.type === 'mdxJsxAttribute' && a.name === name);
  if (!found) return undefined;

  return typeof found.value === 'string' ? found.value : found.value?.value;
}

const classed = (className, text) => ({
  type: 'paragraph',
  data: { hProperties: { className } },
  children: [{ type: 'text', value: text }],
});

const label = (text) => ({
  type: 'paragraph',
  children: [{ type: 'strong', children: [{ type: 'text', value: text }] }],
});

const quote = (className, children) => ({
  type: 'blockquote',
  data: { hProperties: { className } },
  children,
});

/** Components carrying their content as props draw an SVG in the web edition and would
    vanish here, so they leave a mark pointing at the page that can render them. */
const unrenderable = (node, url) =>
  quote('missing-figure', [
    label(`Figure — ${node.name}`),
    {
      type: 'paragraph',
      children: [
        { type: 'text', value: 'This diagram is interactive in the web edition: ' },
        { type: 'link', url, children: [{ type: 'text', value: url }] },
      ],
    },
  ]);

function replacement(node, url, missing) {
  const children = node.children ?? [];

  switch (node.name) {
    case 'Figure': {
      const caption = attr(node, 'caption');

      return caption ? [...children, classed('figcaption', caption)] : children;
    }

    case 'Aside': {
      const type = attr(node, 'type') ?? 'note';
      const title = attr(node, 'title') ?? ASIDE_LABELS[type] ?? 'Note';

      return [quote(`aside aside-${type}`, [label(title), ...children])];
    }

    case 'Callout':
      return [quote('aside', [label(attr(node, 'title') ?? 'Note'), ...children])];

    case 'Tab':
      return [label(attr(node, 'value') ?? 'Example'), ...children];

    case 'FrameworkCheck':
      return [quote('aside', [label(attr(node, 'title') ?? 'Framework check'), ...children])];

    case 'FrameworkOption': {
      const name = attr(node, 'name');

      return [label(FRAMEWORK_LABELS[name] ?? name ?? 'Option'), ...children];
    }

    case 'Card': {
      const title = attr(node, 'title') ?? '';
      const href = attr(node, 'href');
      const strong = { type: 'strong', children: [{ type: 'text', value: title }] };
      const head = href ? { type: 'link', url: href, children: [strong] } : strong;

      return [{ type: 'paragraph', children: [head] }, ...children];
    }

    default:
      if (children.length > 0) return children;

      missing.push(node.name);

      return [unrenderable(node, url)];
  }
}

function stripExpressions(tree) {
  visit(tree, (node, index, parent) => {
    if (!parent) return;
    if (!['mdxjsEsm', 'mdxFlowExpression', 'mdxTextExpression'].includes(node.type)) return;

    parent.children.splice(index, 1);

    return index;
  });
}

function expandComponents(tree, url, missing) {
  visit(tree, (node, index, parent) => {
    if (!parent) return;
    if (node.type !== 'mdxJsxFlowElement' && node.type !== 'mdxJsxTextElement') return;

    parent.children.splice(index, 1, ...replacement(node, url, missing));

    return index;
  });
}

/** A bare fence is a hand-drawn diagram rather than source, and the two need opposite
    wrapping rules once the page is six inches wide. */
function markCodeBlocks(tree) {
  visit(tree, 'code', (node, index, parent) => {
    if (!node.lang) {
      node.data = { ...node.data, hProperties: { className: ['diagram'] } };

      return;
    }

    const title = node.meta?.match(/title="([^"]+)"/)?.[1];
    if (!title) return;

    parent.children.splice(index, 0, classed('code-title', title));

    return index + 2;
  });
}

function applyHeadingIds(tree) {
  const slugger = new GithubSlugger();

  visit(tree, 'heading', (node) => {
    const text = node.children.map((child) => child.value ?? '').join('');
    const id = slugger.slug(text || 'section');
    node.data = { ...node.data, hProperties: { ...node.data?.hProperties, id } };
  });
}

function rewriteLinks(tree, resolve, unresolved) {
  visit(tree, 'link', (node) => {
    const match = node.url.match(/^(\/book(?:\/[^#\s]*)?)(#.*)?$/);
    if (!match) return;

    const target = resolve(match[1]);
    if (target) {
      node.url = `${target}.xhtml${match[2] ?? ''}`;

      return;
    }

    unresolved.push(node.url);
    node.url = siteUrl + node.url;
  });
}

/** A column alignment in GFM becomes the presentational `align` attribute, which XHTML5
    dropped and epubcheck rejects, so it is carried by a class instead. */
function alignTableCells(tree) {
  visit(tree, { type: 'element' }, (node) => {
    const align = node.properties?.align;
    if (!align) return;

    delete node.properties.align;
    node.properties.className = [...(node.properties.className ?? []), `align-${align}`];
  });
}

/** `pre` is what carries the diagram rule, but remark-rehype hangs the class on the inner
    `code`, so it is moved up once the tree is HTML. */
function hoistCodeClasses(tree) {
  visit(tree, { type: 'element', tagName: 'pre' }, (node) => {
    const code = node.children.find((child) => child.tagName === 'code');
    if (code?.properties?.className?.includes('diagram')) node.properties.className = ['diagram'];
  });
}

export async function renderChapter({ source, title, description, url, resolve }) {
  const missing = [];
  const unresolved = [];
  const leftover = [];
  const tree = parser.parse(source);

  stripExpressions(tree);
  expandComponents(tree, url, missing);
  markCodeBlocks(tree);
  applyHeadingIds(tree);
  rewriteLinks(tree, resolve, unresolved);

  visit(tree, (node) => {
    if (node.type.startsWith('mdxJsx')) leftover.push(node.name);
  });

  const hast = await toHast.run(tree);
  hoistCodeClasses(hast);
  alignTableCells(hast);

  const summary = description ? `<p class="chapter-summary">${escapeText(description)}</p>` : '';
  const body = toHtml(hast, { closeSelfClosing: true, characterReferences: { useNamedReferences: false } });

  return { html: `<h1>${escapeText(title)}</h1>${summary}${body}`, missing, unresolved, leftover };
}

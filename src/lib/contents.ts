import type { Node } from 'fumadocs-core/page-tree';
import { docsRoute } from './shared';
import { source } from './source';

export type Chapter = { title: string; url: string };

export type Part = {
  chapters: Chapter[];
  label: string | null;
  /** The book splits itself in two: Parts I-XX are read in order, the catalog and the
      appendices are consulted. The reference half is counted in entries, not chapters. */
  reference: boolean;
  title: string;
  url: string;
};

const referenceRoots = ['patterns', 'appendix'].map((dir) => `${docsRoute}/${dir}`);

function chaptersOf(nodes: Node[]): Chapter[] {
  return nodes.flatMap((node) => {
    if (node.type === 'page') return [{ title: String(node.name), url: node.url }];
    if (node.type === 'folder') return chaptersOf(node.children);
    return [];
  });
}

/** Part titles carry their own numbering, as in "Part IV · Data & Retrieval Engineering".
    Splitting it lets the numeral and the name take different weights on the page. */
function split(name: string) {
  const [label, ...rest] = name.split(' · ');

  return rest.length > 0 ? { label, title: rest.join(' · ') } : { label: null, title: name };
}

/** The book's own table of contents, read from the page tree so the landing page cannot
    drift from what is actually published. */
export function getParts(): Part[] {
  return source.getPageTree().children.flatMap((node) => {
    if (node.type !== 'folder' || typeof node.name !== 'string') return [];

    const chapters = chaptersOf(node.children);
    const url = node.index?.url ?? chapters[0]?.url;
    if (!url) return [];

    return [
      {
        ...split(node.name),
        chapters,
        reference: referenceRoots.some((root) => url.startsWith(root)),
        url,
      },
    ];
  });
}

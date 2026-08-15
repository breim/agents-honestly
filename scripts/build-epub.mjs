import { execFileSync } from 'node:child_process';
import { copyFile, mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { appTagline, authorName, githubUrl, readBook, root, siteUrl } from './epub/book.mjs';
import { escapeText, renderChapter } from './epub/chapter.mjs';

const bookId = 'urn:uuid:6f9c1a52-8a3e-4a2f-9c1d-2b7e5f04a0c1';
const bookTitle = 'Agents, Honestly';
const language = 'en';
const rights = 'Creative Commons Attribution 4.0 International (CC BY 4.0)';

const dist = join(root, 'dist');
const stage = join(dist, 'epub');
const oebps = join(stage, 'OEBPS');
const monoFont = 'node_modules/geist/dist/fonts/geist-mono/GeistMono-Regular.ttf';

const document = (title, body, extra = '') => `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="${language}" xml:lang="${language}">
<head>
<meta charset="utf-8"/>
<title>${escapeText(title)}</title>
<link rel="stylesheet" type="text/css" href="style.css"/>
${extra}</head>
<body>
${body}
</body>
</html>
`;

function navList(nodes) {
  const items = nodes.map((node) =>
    node.type === 'chapter'
      ? `<li><a href="${node.id}.xhtml">${escapeText(node.title)}</a></li>`
      : `<li><a href="${node.partId}.xhtml">${escapeText(node.title)}</a>${navList(node.children)}</li>`,
  );

  return `<ol>${items.join('')}</ol>`;
}

/** Parts are sidebar groups on the web, where the reader always sees the tree. Read in
    sequence they need a page of their own, or Part II opens mid-stride. */
const partPage = (part) =>
  document(part.title, `<section epub:type="bodymatter"><h1 class="part-title">${escapeText(part.title)}</h1></section>`);

function assignPartIds(nodes, prefix = 'part') {
  nodes.forEach((node, index) => {
    if (node.type !== 'part') return;

    node.partId = `${prefix}-${index + 1}`;
    assignPartIds(node.children, node.partId);
  });
}

function spineOf(nodes) {
  return nodes.flatMap((node) => (node.type === 'chapter' ? [node] : [node, ...spineOf(node.children)]));
}

const book = readBook();
assignPartIds(book.parts);

const spine = spineOf(book.parts);
const missing = [];
const unresolved = [];
const leftover = [];

const out = join(dist, 'agents-honestly.epub');

await rm(stage, { recursive: true, force: true });
await rm(out, { force: true });
await mkdir(join(oebps, 'fonts'), { recursive: true });
await mkdir(join(stage, 'META-INF'), { recursive: true });

for (const entry of spine) {
  if (entry.type === 'part') {
    await writeFile(join(oebps, `${entry.partId}.xhtml`), partPage(entry));
    continue;
  }

  const rendered = await renderChapter({ ...entry, resolve: book.resolve });

  missing.push(...rendered.missing.map((name) => `${entry.url} → <${name}>`));
  unresolved.push(...rendered.unresolved.map((url) => `${entry.url} → ${url}`));
  leftover.push(...rendered.leftover.map((name) => `${entry.url} → <${name}>`));

  await writeFile(join(oebps, `${entry.id}.xhtml`), document(entry.title, rendered.html));
}

await writeFile(
  join(oebps, 'cover.xhtml'),
  document(
    'Cover',
    `<section epub:type="cover" class="cover"><img src="cover.png" alt="${escapeText(bookTitle)}"/></section>`,
  ),
);

await writeFile(
  join(oebps, 'nav.xhtml'),
  document(
    'Contents',
    `<nav epub:type="toc" id="toc"><h1>Contents</h1>${navList(book.parts)}</nav>
<nav epub:type="landmarks" hidden="hidden">
<ol>
<li><a epub:type="cover" href="cover.xhtml">Cover</a></li>
<li><a epub:type="toc" href="nav.xhtml">Contents</a></li>
<li><a epub:type="bodymatter" href="${spine[0].id ?? spine[0].partId}.xhtml">Start</a></li>
</ol>
</nav>`,
  ),
);

const manifest = spine
  .map((entry) => {
    const id = entry.type === 'part' ? entry.partId : entry.id;

    return `<item id="c-${id}" href="${id}.xhtml" media-type="application/xhtml+xml"/>`;
  })
  .join('\n');

const spineRefs = spine
  .map((entry) => `<itemref idref="c-${entry.type === 'part' ? entry.partId : entry.id}"/>`)
  .join('\n');

await writeFile(
  join(oebps, 'content.opf'),
  `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid" xml:lang="${language}">
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
<dc:identifier id="bookid">${bookId}</dc:identifier>
<dc:title>${escapeText(bookTitle)}</dc:title>
<dc:creator id="author">${escapeText(authorName)}</dc:creator>
<dc:language>${language}</dc:language>
<dc:description>${escapeText(appTagline)}</dc:description>
<dc:rights>${escapeText(rights)}</dc:rights>
<dc:source>${siteUrl}</dc:source>
<dc:relation>${githubUrl}</dc:relation>
<meta refines="#author" property="role" scheme="marc:relators">aut</meta>
<meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d+Z$/, 'Z')}</meta>
</metadata>
<manifest>
<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
<item id="cover" href="cover.xhtml" media-type="application/xhtml+xml"/>
<item id="cover-image" href="cover.png" media-type="image/png" properties="cover-image"/>
<item id="style" href="style.css" media-type="text/css"/>
<item id="font-mono" href="fonts/GeistMono-Regular.ttf" media-type="font/ttf"/>
${manifest}
</manifest>
<spine>
<itemref idref="cover"/>
<itemref idref="nav"/>
${spineRefs}
</spine>
</package>
`,
);

await writeFile(join(stage, 'mimetype'), 'application/epub+zip');
await writeFile(
  join(stage, 'META-INF/container.xml'),
  `<?xml version="1.0" encoding="utf-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
<rootfiles>
<rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
</rootfiles>
</container>
`,
);

await copyFile(join(root, 'scripts/epub/style.css'), join(oebps, 'style.css'));
await copyFile(join(root, monoFont), join(oebps, 'fonts/GeistMono-Regular.ttf'));
await copyFile(join(dist, 'cover.png'), join(oebps, 'cover.png'));

/** `mimetype` must be the first entry and stored uncompressed, which is why it is zipped
    in its own pass before everything else. */
execFileSync('zip', ['-X0q', out, 'mimetype'], { cwd: stage });
execFileSync('zip', ['-Xr9Dq', out, 'META-INF', 'OEBPS'], { cwd: stage });

const report = (title, entries) => {
  if (entries.length === 0) return;

  console.log(`\n${title} (${entries.length})`);
  for (const entry of [...new Set(entries)].slice(0, 12)) console.log(`  ${entry}`);
};

console.log(`${book.chapters.length} chapters, ${book.parts.length} parts → dist/agents-honestly.epub`);
report('Chapters listed in meta.json without a file', book.skipped);
report('Components with no EPUB rendering', missing);
report('Links that resolved to the website', unresolved);
report('MDX left in the tree', leftover);

import { fields, type Field } from './fields';
import { Plate } from './plate';
import { bayerMatrix, fromMatrix, orderedDither } from './screens';

/** Sixteen cells, because a favicon is sixteen CSS pixels and there is no version of this
    that gets to pretend otherwise. */
const size = 16;

/** Bayer 4×4, the same screen every plate above runs. Four cells wide against a sixteen-cell
    icon, so the tile is a quarter of the picture rather than a texture laid over it. */
const screen = orderedDither(fromMatrix(bayerMatrix(4)));

export type Ink = (x: number, y: number) => number;

export function FaviconPlate({ ink }: { ink: Ink }) {
  return <Plate cols={size} dither={screen} ink={ink} rows={size} />;
}

/** The icon grid onto the centred square the fields expect. */
const sampled =
  (field: Field): Ink =>
  (x, y) =>
    field(x / (size - 1) - 0.5, y / (size - 1) - 0.5);

/** Hand-set proposals are written as the grid itself, at the size they ship. A solid or bare
    cell passes through the screen untouched; the two middle tones are the only places a
    hand-set proposal lets the dither decide anything. */
const tones: Record<string, number> = { '#': 1, '+': 0.5, '-': 0.25, '.': 0 };

const glyph =
  (rows: string[]): Ink =>
  (x, y) =>
    tones[rows[y][x]];

/** The lab sphere with its silhouette held. Lambert still decides everything, but the disc
    prints solid anywhere the light has turned away, and the lit cap is cut out of it instead
    of drawn into it — so the shape survives a screen that has four tiles to spend. */
export const carvedSphere: Field = (p, q) => {
  const size = 0.4;
  const distance = Math.hypot(p, q);

  if (distance > size) return 0;

  const height = Math.sqrt(size * size - distance * distance);
  const lambert = Math.min(1, Math.max(0, (p * -0.52 + q * -0.58 + height * 0.63) / size)) ** 0.85;

  if (lambert > 0.86) return 0;

  return lambert > 0.78 ? 0.5 : 1;
};

export type FaviconEntry = { ink: Ink; name: string; note: string; spec: string };

export const faviconEntries: FaviconEntry[] = [
  {
    ink: () => 0.5,
    name: 'Midtone',
    note: "The first thing anyone tries: point the page's own material at a sixteen-pixel box and see what comes out. The tile is four cells wide, so the icon holds exactly four of them, and every tone from 6/16 to 10/16 resolves to the same checkerboard — which a browser tab, rendering it a quarter of an inch wide, draws as a grey square.",
    spec: 'flat 8/16 · Bayer 4×4',
  },
  {
    ink: sampled(fields.glow),
    name: 'Wash',
    note: 'The one technique in the archive that reached a commit, reduced to the size of a tab. The falloff has about six cells to spend before it runs out of tones, and what survives is a dense corner and an empty one: readable, but what you have made is a gradient, not a mark.',
    spec: 'exponential falloff · corner origin',
  },
  {
    ink: sampled(fields.sphere),
    name: 'Sphere',
    note: 'The hero idiom of the last three years, printed at the size nobody ever prints it. The lit cap holds for about nine rows. Everything the light turns away from has no ink to be drawn with, so the silhouette never closes, and what comes out is a smudge in the upper left with a speckled tail — the roundness the full plate gets for free is simply gone.',
    spec: 'lambert falloff · 12-cell disc',
  },
  {
    ink: sampled(fields.vignette),
    name: 'Aperture',
    note: 'Vignette turned into a mark: ink around the edges, bare through the middle. The corners hold, because that is where the falloff runs deepest and where two edges overlap; the middle of each edge thins out to scattered single cells. It is the closest a field on this page comes to a mark, and it is still a frame with holes in it.',
    spec: 'radial edge falloff',
  },
  {
    ink: (_x, y) => [1, 0.68, 0.38, 0.12][Math.floor(y / 4)],
    name: 'Colophon',
    note: 'The footer strip cut from seventeen tones down to four and stood on end. Four is the most a sixteen-pixel square can hold and still let you count them, and this is the only proposal that says what the site is about — a press, and whether it is being honest — without drawing a thing.',
    spec: '4 bands · 16/11/6/2',
  },
  {
    ink: glyph([
      '................',
      '................',
      '..#######.......',
      '..#######.......',
      '..##........##..',
      '..##........##..',
      '..##........##..',
      '..##...##...##..',
      '..##...##...##..',
      '..##........##..',
      '..##........##..',
      '..##........##..',
      '..############..',
      '..############..',
      '................',
      '................',
    ]),
    name: 'Loop',
    note: "The book's actual subject: a loop that runs, around the one thing it is holding, with the gap left open because the interesting part of an agent loop is the edge it never closes. Two cells of stroke is the thinnest line that survives at 1× without going grey on you.",
    spec: 'hand-set · 2-cell stroke',
  },
  {
    ink: glyph([
      '................',
      '................',
      '......####......',
      '......####......',
      '......####......',
      '......####......',
      '......####......',
      '......####......',
      '......####......',
      '......####......',
      '......####......',
      '......####......',
      '................',
      '...##########...',
      '................',
      '................',
    ]),
    name: 'Caret',
    note: 'The landing page is a flat black-and-white console now, and this is what a console looks like at sixteen pixels. It carries more contrast than anything else here and less meaning: you would find the tab instantly and learn nothing from having found it.',
    spec: 'hand-set · 4×10 block',
  },
  {
    ink: glyph([
      '................',
      '................',
      '......####......',
      '.....######.....',
      '.....##..##.....',
      '....##....##....',
      '....##....##....',
      '...##......##...',
      '...##########...',
      '...##########...',
      '..##........##..',
      '..##........##..',
      '.##..........##.',
      '.##..........##.',
      '................',
      '................',
    ]),
    name: 'Monogram',
    note: 'The letter, cut to the grid, with nothing dithered in it anywhere. It earns its place on this page by losing the argument honestly: at this size a silhouette beats a texture every time, and the counter of an A is about the largest legible shape a sixteen-pixel square has to offer.',
    spec: 'hand-set · no dither',
  },
  {
    ink: glyph([
      '................',
      '................',
      '..##.#########..',
      '..##.#########..',
      '..##.#########..',
      '..##.+++++++++..',
      '..##.+++++++++..',
      '..##.+++++++++..',
      '..##.---------..',
      '..##.---------..',
      '..##.---------..',
      '..##............',
      '..##.#########..',
      '..##.#########..',
      '................',
      '................',
    ]),
    name: 'Spine',
    note: 'A book seen edge on, with the colophon running down it — solid, half, quarter, solid. It is the only proposal carrying the object and the material at the same time, and the two middle bands are the only cells on the icon where the screen is deciding anything.',
    spec: 'hand-set · 3 tones',
  },
  {
    ink: (x, y) => (x + y < 15 ? 1 : 0.5),
    name: 'Half',
    note: 'The whole square, cut once. Solid ink against a flat midtone is the largest step this page can print, and at sixteen pixels the diagonal is the only edge the eye is given to hold — which makes this either the most confident mark here or the emptiest one.',
    spec: 'diagonal split · solid over 8/16',
  },
  {
    ink: sampled(carvedSphere),
    name: 'Sphere, carved',
    note: 'The one that ships, and the only proposal here that had to be changed to survive being one. It is the same field, the same light and the same screen as the sphere above; what moved is which side of the ball the ink is spent on. Solid wherever the light has turned away, cut out where it has not, and a single half-tone band left along the terminator for the screen to do something with. The silhouette closes, so the shape reads at sixteen pixels — and every argument the plate above makes about spheres at this size still stands, because this one only works by giving up on being shaded.',
    spec: 'carved silhouette · 1 fringe band',
  },
];

import { errorDiffusion, kernels, riemersma } from './diffusion';
import { Plate } from './plate';
import {
  bayerMatrix,
  fromMatrix,
  interleavedGradientNoise,
  orderedDither,
  spotMatrix,
  spots,
  whiteNoise,
  type Dither,
} from './screens';
import { voidAndClusterMatrix } from './void-and-cluster';

const cols = 96;
const rows = 16;

/** One source for every plate: bare page on the left, solid ink on the right. A flat ramp is
    the hardest thing to dither and the easiest to read — whatever structure you see in a
    plate below, the source did not put it there. The algorithm did. */
const ramp = (x: number) => x / (cols - 1);

export function RampPlate({ dither }: { dither: Dither }) {
  return <Plate cols={cols} dither={dither} ink={ramp} rows={rows} />;
}

export type Entry = { dither: Dither; name: string; note: string; spec: string };

export const orderedScreens: Entry[] = [
  {
    dither: orderedDither(fromMatrix(bayerMatrix(2))),
    name: 'Bayer 2×2',
    note: 'The whole ordered family in miniature: four thresholds, five tones, and a tile so coarse you read the matrix before you read the picture.',
    spec: '2×2 matrix · 5 tones',
  },
  {
    dither: orderedDither(fromMatrix(bayerMatrix(8))),
    name: 'Bayer 8×8',
    note: 'Two more turns of the same recursion. Sixty-five tones, texture below the size the eye resolves — and a crosshatch that never goes away, it only gets finer.',
    spec: '8×8 matrix · 65 tones',
  },
  {
    dither: orderedDither(fromMatrix(bayerMatrix(16))),
    name: 'Bayer 16×16',
    note: 'Two hundred and fifty-seven tones, and the point at which the recursion stops paying. Set this beside the 8×8 above and look for the difference: there is one, and it is not one the eye was ever going to find on a screen.',
    spec: '16×16 matrix · 257 tones',
  },
  {
    dither: orderedDither(fromMatrix(bayerMatrix(32))),
    name: 'Bayer 32×32',
    note: 'A thousand and twenty-five tones. Past a certain fineness a dither buys tones nobody can tell apart and quietly turns back into the gradient it exists to replace — which is the argument for choosing a matrix by the texture you want, not by the tone count.',
    spec: '32×32 matrix · 1025 tones',
  },
  {
    dither: orderedDither(fromMatrix(spotMatrix(8, spots.clusteredDot))),
    name: 'Clustered Dot',
    note: 'Ink grows outward from one point per tile instead of scattering. Every printing press works this way, because a press can hold a fat dot and cannot hold a lone pixel.',
    spec: '8×8 spot screen',
  },
  {
    dither: orderedDither(fromMatrix(spotMatrix(16, spots.rotatedScreen))),
    name: 'Rotated Screen',
    note: 'Two spots per tile on the diagonal — the angle newspapers settled on, because a lattice tilted 45° is the one the eye is worst at picking out of a photograph.',
    spec: '16×16 spot screen · 45°',
  },
  {
    dither: orderedDither(fromMatrix(spotMatrix(8, spots.diamond))),
    name: 'Diamond Screen',
    note: 'The clustered dot measured in city blocks rather than straight lines, so the spot grows as a square standing on its corner and the midtones lock together edge to edge.',
    spec: '8×8 spot screen',
  },
  {
    dither: orderedDither(fromMatrix(spotMatrix(8, spots.horizontalLine))),
    name: 'Line Screen',
    note: 'Ink thickens along a line instead of around a point. Coarser than a dot screen at the same pitch, and far more forgiving of a press that smears.',
    spec: '8×8 spot screen',
  },
  {
    dither: orderedDither(fromMatrix(spotMatrix(8, spots.diagonalLine))),
    name: 'Diagonal Line Screen',
    note: 'The same line, tilted. The tilt is the entire point: horizontal rules fight the horizontal grid of pixels underneath them, and a diagonal does not.',
    spec: '8×8 spot screen · 45°',
  },
  {
    dither: orderedDither(fromMatrix(spotMatrix(8, spots.crosshatch))),
    name: 'Crosshatch Screen',
    note: 'Two line screens at right angles, so the shadows close into a mesh and the highlights open into a window frame. The engraver’s trick, run as a threshold matrix.',
    spec: '8×8 spot screen',
  },
  {
    dither: orderedDither(fromMatrix(voidAndClusterMatrix(32))),
    name: 'Void-and-Cluster',
    note: 'Ulichney, 1993. Blue noise: no two dots close, no stretch left empty. Built by pulling dots from the tightest cluster into the largest void and recording the order it happened in — a thousand and twenty-four tones, no lattice, and the cost of a lookup.',
    spec: '32×32 blue-noise mask',
  },
  {
    dither: orderedDither(interleavedGradientNoise),
    name: 'Interleaved Gradient Noise',
    note: 'Jimenez, SIGGRAPH 2014. Three multiplies and two fractional parts — no table, no memory fetch. Not blue noise, but much nearer to it than a formula that short has any right to be.',
    spec: 'closed form · no table',
  },
  {
    dither: orderedDither(whiteNoise),
    name: 'White Noise',
    note: 'A hash per cell and no tile at all. The control: every cell decides alone, and the clumping that follows is the reason none of the others do it this way.',
    spec: 'per-cell hash',
  },
];

export const errorDiffusionKernels: Entry[] = [
  {
    dither: errorDiffusion(kernels.floydSteinberg),
    name: 'Floyd–Steinberg',
    note: 'Print the nearest tone, then push the whole of what you got wrong onto four cells you have not decided yet. Fifty years on it is still the default; everything since buys a little less worming with a lot more arithmetic.',
    spec: '4 taps ÷ 16',
  },
  {
    dither: errorDiffusion(kernels.jarvisJudiceNinke),
    name: 'Jarvis–Judice–Ninke',
    note: 'Three times the taps, spread two rows deep. Smoother, and softer: error carried that far blurs the edge it came from.',
    spec: '12 taps ÷ 48',
  },
  {
    dither: errorDiffusion(kernels.stucki),
    name: 'Stucki',
    note: 'Jarvis reweighted onto powers of two, which on 1981 hardware meant shifts instead of divides. Same reach, cheaper, marginally crisper.',
    spec: '12 taps ÷ 42',
  },
  {
    dither: errorDiffusion(kernels.burkes),
    name: 'Burkes',
    note: 'Stucki with the third row deleted. Nearly the same picture for two-thirds of the work — which is the trade every kernel after Floyd–Steinberg is really making.',
    spec: '7 taps ÷ 32',
  },
  {
    dither: errorDiffusion(kernels.sierra),
    name: 'Sierra',
    note: 'Keeps Jarvis’s reach but pulls the weight back toward the cell it came from, so fine detail survives better than the spread would suggest.',
    spec: '10 taps ÷ 32',
  },
  {
    dither: errorDiffusion(kernels.twoRowSierra),
    name: 'Two-Row Sierra',
    note: 'Sierra’s own cut of Sierra: one row of lookahead buffer instead of two, for a difference you have to go looking for.',
    spec: '7 taps ÷ 16',
  },
  {
    dither: errorDiffusion(kernels.sierraLite),
    name: 'Sierra Lite',
    note: 'Three taps over a divisor of four — the cheapest kernel that still reads as error diffusion rather than as noise.',
    spec: '3 taps ÷ 4',
  },
  {
    dither: errorDiffusion(kernels.atkinson),
    name: 'Atkinson',
    note: 'Bill Atkinson, for the first Macintosh. The one kernel that deliberately loses: six taps over eight throw away a quarter of the error at every cell. Blacks block up, whites blow out, midtones come back sharper — the reason those dithered photographs still read as a look rather than a limitation.',
    spec: '6 taps ÷ 8 · sheds ¼ of the error',
  },
];

export const curveWalks: Entry[] = [
  {
    dither: riemersma(),
    name: 'Riemersma',
    note: 'Error diffusion needs a scan order, and a scan order is a direction the artefacts can line up along. So walk a Hilbert curve instead: it reaches every cell, never jumps, and has no direction to speak of. The error goes into a short queue weighted toward the most recent cell, which caps how far any one mistake can travel — an ordered screen’s locality, without the lattice.',
    spec: '16-deep queue · Hilbert curve',
  },
];

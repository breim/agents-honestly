import { whiteNoise } from './screens';

/** How much ink the picture asks for at a point, before anything decides where dots go.
    Coordinates are centred and aspect-corrected: `q` runs -0.5 to 0.5 top to bottom, `p`
    runs wider by the plate's aspect, so a circle comes out round. */
export type Field = (p: number, q: number) => number;

const fract = (n: number) => n - Math.floor(n);
const clamp = (n: number) => Math.min(1, Math.max(0, n));

/** Hermite fade between two edges. Reverse the edges to fade the other way. */
function ramp(from: number, to: number, n: number) {
  const t = clamp((n - from) / (to - from));

  return t * t * (3 - 2 * t);
}

/** Value noise: the hash sampled on an integer lattice, smoothed between the corners. Not
    Perlin's gradient noise, but on a grid this coarse nothing survives that would tell them
    apart. */
function valueNoise(x: number, y: number) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);

  const top = whiteNoise(ix, iy) * (1 - sx) + whiteNoise(ix + 1, iy) * sx;
  const bottom = whiteNoise(ix, iy + 1) * (1 - sx) + whiteNoise(ix + 1, iy + 1) * sx;

  return top * (1 - sy) + bottom * sy;
}

/** Octaves of the same noise, each half the amplitude and twice the frequency. Detail all the
    way down, which is why it reads as cloud rather than as static. */
function fbm(x: number, y: number, octaves = 4) {
  let sum = 0;
  let weight = 0.5;
  let scale = 1;
  let total = 0;

  for (let octave = 0; octave < octaves; octave += 1) {
    sum += weight * valueNoise(x * scale, y * scale);
    total += weight;
    weight *= 0.5;
    scale *= 2;
  }

  return sum / total;
}

/** A ball lit from the upper left. There is no sphere here and no renderer: for each point
    inside the silhouette the height of the surface is solved for directly, and the ink is how
    squarely that point faces the light. Everything reading as roundness is the falloff. */
const sphere: Field = (p, q) => {
  const size = 0.4;
  const distance = Math.hypot(p, q);

  if (distance > size) return 0;

  const height = Math.sqrt(size * size - distance * distance);
  const lambert = (p * -0.52 + q * -0.58 + height * 0.63) / size;

  return clamp(lambert) ** 0.85;
};

/** Rings off a struck point, losing height as they travel. */
const ripple: Field = (p, q) => {
  const distance = Math.hypot(p, q);

  return clamp((0.5 + 0.5 * Math.sin(distance * 46 - 1.2)) * Math.exp(-distance * 3.4));
};

/** A sine bent by another sine — the cheapest thing that stops reading as stripes. */
const wave: Field = (p, q) => 0.5 + 0.5 * Math.sin(p * 9 + Math.sin(q * 7 + p * 2) * 1.6);

/** Bands wound around a centre: the angle is offset by the radius, so straight arms become a
    spiral without any spiral being drawn. */
const swirl: Field = (p, q) => {
  const distance = Math.hypot(p, q);
  const angle = Math.atan2(q, p) + distance * 9;

  return clamp((0.5 + 0.5 * Math.sin(angle * 3)) * ramp(0.62, 0.12, distance));
};

/** Fractal noise straight up: the cloud every shader reaches for first. Two octaves, not four
    — the finest octave has to stay coarser than the screen's tile or the screen has no
    gradient to carry and the plate reads as static. */
const simplex: Field = (p, q) => clamp(fbm(p * 1.7 + 11, q * 1.7 + 7, 2) * 1.5 - 0.26);

/** The same noise, but sampled at coordinates that noise has already displaced. One extra
    lookup turns clouds into something that looks poured. */
const warp: Field = (p, q) => {
  const dx = fbm(p * 1.3 + 1.7, q * 1.3 + 9.2, 2);
  const dy = fbm(p * 1.3 + 5.3, q * 1.3 + 2.8, 2);

  return clamp(fbm(p * 1.3 + dx * 2.2, q * 1.3 + dy * 2.2, 2) * 1.7 - 0.34);
};

/** Three points, each radiating a field that falls off with the square of distance. Where two
    fields overlap the sum crosses the threshold early, so the shapes reach for each other and
    merge before they touch. */
const metaball: Field = (p, q) => {
  const centres = [
    [-0.34, -0.08, 0.052],
    [0.06, 0.11, 0.07],
    [0.36, -0.06, 0.044],
  ];

  let energy = 0;
  for (const [cx, cy, mass] of centres) {
    energy += mass / ((p - cx) ** 2 + (q - cy) ** 2 + 0.0016);
  }

  return ramp(0.9, 2.6, energy);
};

/** Read the noise as elevation and ink only where it crosses a fixed height. A contour map is
    a picture of a surface drawn entirely out of the places it is not. */
const contour: Field = (p, q) => {
  const elevation = fbm(p * 1.5 + 4.5, q * 1.5 + 1.3, 2);
  const distanceToLine = Math.abs(fract(elevation * 5) * 2 - 1);

  return clamp(1 - ramp(0, 0.62, distanceToLine));
};

/** Ink at the edges, nothing in the middle. The oldest trick in print for putting a subject
    where you want it without drawing anything around it. */
const vignette: Field = (p, q) => ramp(0.28, 0.72, Math.hypot(p, q));

/** Rings spaced by the reciprocal of the radius, which is what perspective does to anything
    evenly spaced running away from you. The centre is faded out because the frequency there
    goes to infinity and the grid cannot hold it. */
const tunnel: Field = (p, q) => {
  const distance = Math.max(Math.hypot(p, q), 0.02);
  const rings = 0.5 + 0.5 * Math.sin(2.6 / distance - 2);

  return clamp(rings * ramp(0.03, 0.34, distance) * ramp(1, 0.4, distance));
};

/** A light source with a long exponential falloff — a lamp seen through air, not a sphere.
    The difference matters: a sphere has an edge, and this has to have none. */
const glow: Field = (p, q) => clamp(Math.exp(-Math.hypot(p + 0.45, q + 0.3) * 4.1));

/** Cloud banks: two octaves, low frequency, sampled twice as often vertically because weather
    is wider than it is tall. The frequency is the whole point. A dither exists to carry a
    gradient through quantisation, so its source has to have a gradient — give it detail finer
    than the tile and there is nothing left to carry, the screen fights the noise, and the
    plate turns to mud. Every feature here is wider than the 4×4 tile on purpose. */
const clouds: Field = (p, q) => clamp(fbm(p * 1.5 + 3.1, q * 3 + 8.4, 2) * 1.85 - 0.42);

/** All three at once, which is the only one of these that reads as a picture rather than as a
    demo. The glow lifts the cloud it sits behind instead of replacing it, and a ragged ridge
    takes the bottom of the frame back to the darkest ink — the silhouette doing the same job
    a horizon does in a photograph, which is to tell you where you are standing. */
const nocturne: Field = (p, q) => {
  const ridge = 0.3 + fbm(p * 7 + 21, 4) * 0.17;

  if (q > ridge) return 0;

  return clamp(clouds(p, q) * 0.58 + glow(p, q) * 0.92);
};

/** The closest thing this page can generate to a photograph: a lit ball sitting on a ground
    that grades toward a horizon. Enough tonal range, and enough of a hard edge, to tell the
    screens apart the way a real image would. */
const scene: Field = (p, q) => {
  const bx = p + 0.08;
  const by = q + 0.06;
  const ground = clamp(0.78 - (q + 0.5) * 0.72);

  if (Math.hypot(bx, by) > 0.34) return ground;

  const height = Math.sqrt(0.34 * 0.34 - bx * bx - by * by);

  return clamp((bx * -0.5 + by * -0.6 + height * 0.62) / 0.34) ** 0.8;
};

/** A symmetric field keyed to a seed. Mirroring the sampling in x is the whole reason an
    identicon reads as a face rather than as noise; the seed is the only thing that changes. */
export function avatarField(seed: number): Field {
  return (p, q) =>
    clamp(fbm(Math.abs(p) * 3.2 + seed * 31.7, q * 3.2 + seed * 17.3, 2) * 2.6 - 0.76);
}

export const fields = {
  clouds,
  contour,
  glow,
  metaball,
  nocturne,
  ripple,
  scene,
  simplex,
  sphere,
  swirl,
  tunnel,
  vignette,
  warp,
  wave,
};

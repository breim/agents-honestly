import { whiteNoise } from './screens';

/** Ulichney's filter width. Wide enough that a cell feels its neighbours, narrow enough that
    the pattern stays local. */
const sigma = 1.9;

function gaussianTaps(size: number) {
  const reach = Math.min(Math.floor(size / 2), Math.ceil(sigma * 3));
  const taps: { dx: number; dy: number; weight: number }[] = [];

  for (let dy = -reach; dy <= reach; dy += 1) {
    for (let dx = -reach; dx <= reach; dx += 1) {
      taps.push({ dx, dy, weight: Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma)) });
    }
  }

  return taps;
}

/** Ulichney's void-and-cluster, 1993. Blue noise is not random: it is a pattern with no two
    dots close together and no empty stretch either, which is the distribution the eye is
    worst at resolving. You get it by repeatedly pulling a dot out of the tightest cluster and
    dropping it into the largest void, then recording the order that removal and insertion
    happened in. That order is the threshold matrix.

    The energy field is Gaussian-weighted and wraps at the edges, so the tile repeats
    seamlessly — the mask is built on a torus, not a square. */
export function voidAndClusterMatrix(size: number): number[][] {
  const total = size * size;
  const taps = gaussianTaps(size);
  const energy = new Float64Array(total);

  const spread = (index: number, sign: number) => {
    const x = index % size;
    const y = Math.floor(index / size);

    for (const { dx, dy, weight } of taps) {
      energy[((y + dy + size) % size) * size + ((x + dx + size) % size)] += sign * weight;
    }
  };

  const recharge = (state: Uint8Array, target: number) => {
    energy.fill(0);
    for (let i = 0; i < total; i += 1) if (state[i] === target) spread(i, 1);
  };

  const pick = (state: Uint8Array, target: number, densest: boolean) => {
    let best = -1;

    for (let i = 0; i < total; i += 1) {
      if (state[i] !== target) continue;
      if (best < 0 || (densest ? energy[i] > energy[best] : energy[i] < energy[best])) best = i;
    }

    return best;
  };

  const seed = new Uint8Array(total);
  let ones = 0;

  for (let i = 0; i < total; i += 1) {
    if (whiteNoise(i % size, Math.floor(i / size)) < 0.1) {
      seed[i] = 1;
      ones += 1;
    }
  }

  /** Relax the random seed until the tightest cluster and the largest void are the same cell:
      the point where no swap improves the spread. Bounded because a render must terminate. */
  recharge(seed, 1);
  for (let step = 0; step < total; step += 1) {
    const cluster = pick(seed, 1, true);
    seed[cluster] = 0;
    spread(cluster, -1);

    const hole = pick(seed, 0, false);
    seed[hole] = 1;
    spread(hole, 1);

    if (hole === cluster) break;
  }

  const ranks = new Array<number>(total);
  const state = Uint8Array.from(seed);

  /** Take the seed apart, tightest cluster first, and number the dots backwards from where
      the seed sat. These are the tones lighter than the seed. */
  recharge(state, 1);
  for (let rank = ones - 1; rank >= 0; rank -= 1) {
    const cluster = pick(state, 1, true);
    state[cluster] = 0;
    spread(cluster, -1);
    ranks[cluster] = rank;
  }

  /** Build it back up, largest void first, to the halfway tone. */
  const half = Math.floor(total / 2);
  state.set(seed);
  recharge(state, 1);
  for (let rank = ones; rank < half; rank += 1) {
    const hole = pick(state, 0, false);
    state[hole] = 1;
    spread(hole, 1);
    ranks[hole] = rank;
  }

  /** Past halfway the bare cells are the minority, so the roles swap: the energy field now
      measures the holes, and the one to fill is the tightest cluster of them. */
  recharge(state, 0);
  for (let rank = half; rank < total; rank += 1) {
    const cluster = pick(state, 0, true);
    state[cluster] = 1;
    spread(cluster, -1);
    ranks[cluster] = rank;
  }

  return Array.from({ length: size }, (_, y) => ranks.slice(y * size, (y + 1) * size));
}

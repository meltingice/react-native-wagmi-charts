import type { TLineChartComputedPath } from '../types';

function interpolateY(
  left: { x: number; y: number },
  right: { x: number; y: number },
  x: number
) {
  'worklet';
  if (right.x === left.x) {
    return left.y;
  }

  const progress = (x - left.x) / (right.x - left.x);
  return left.y + (right.y - left.y) * progress;
}

export function getYForX(path: TLineChartComputedPath, x: number) {
  'worklet';
  const samples = path.points;

  if (!samples.length) {
    return 0;
  }

  if (x <= samples[0]!.x) {
    return samples[0]!.y;
  }

  const lastSample = samples[samples.length - 1]!;
  if (x >= lastSample.x) {
    return lastSample.y;
  }

  let low = 0;
  let high = samples.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const sample = samples[mid]!;

    if (sample.x === x) {
      return sample.y;
    }

    if (sample.x < x) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  const left = samples[Math.max(0, high)]!;
  const right = samples[Math.min(samples.length - 1, low)]!;

  return interpolateY(left, right, x);
}

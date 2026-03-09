import type { TLineChartComputedPath } from '../types';

export function getXPositionForCurve(path: TLineChartComputedPath, index: number) {
  'worklet';
  if (index < 0 || index >= path.points.length) {
    throw new Error(
      `Index out of bounds: ${index}. ` +
        `Expected an integer in the range [0, ${Math.max(
          path.points.length - 1,
          0
        )}]`
    );
  }

  return path.points[index]!.x;
}

import type { TLineChartComputedPath, TLineChartRenderPoint } from '../types';

export function getComputedPath({
  points,
}: {
  points: TLineChartRenderPoint[];
}): TLineChartComputedPath {
  const firstPoint = points[0];

  if (!firstPoint) {
    return {
      move: { x: 0, y: 0 },
      curves: [],
      points: [],
      samples: [],
      length: 0,
    };
  }

  return {
    move: { x: firstPoint.x, y: firstPoint.y },
    curves: points.slice(1).map((point) => ({
      to: {
        x: point.x,
        y: point.y,
      },
    })),
    points,
    samples: points.map((point, index) => ({
      x: point.x,
      y: point.y,
      progress: points.length <= 1 ? 1 : index / (points.length - 1),
      length: index,
    })),
    length: points.length,
  };
}

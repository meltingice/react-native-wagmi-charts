import { svgPathProperties } from 'svg-path-properties';

import type { TLineChartComputedPath, TLineChartRenderPoint } from '../types';

const MIN_SAMPLE_COUNT = 60;

export function getComputedPath({
  path,
  points,
}: {
  path: string;
  points: TLineChartRenderPoint[];
}): TLineChartComputedPath {
  const firstPoint = points[0];

  if (!path || !firstPoint) {
    return {
      move: { x: 0, y: 0 },
      curves: [],
      points: [],
      samples: [],
      length: 0,
    };
  }

  const properties = new svgPathProperties(path);
  const length = properties.getTotalLength();
  const sampleCount = Math.max(
    MIN_SAMPLE_COUNT,
    points.length * 24,
    Math.ceil(length / 3)
  );

  const samples = Array.from({ length: sampleCount + 1 }, (_, index) => {
    const sampleLength = (length * index) / sampleCount;
    const { x, y } = properties.getPointAtLength(sampleLength);

    return {
      x,
      y,
      progress: sampleCount === 0 ? 1 : index / sampleCount,
      length: sampleLength,
    };
  });

  return {
    move: { x: firstPoint.x, y: firstPoint.y },
    curves: points.slice(1).map((point) => ({
      to: {
        x: point.x,
        y: point.y,
      },
    })),
    points,
    samples,
    length,
  };
}

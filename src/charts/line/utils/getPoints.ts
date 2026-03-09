import { scaleLinear } from 'd3-scale';

import type {
  TLineChartData,
  TLineChartRenderPoint,
  YDomain,
} from '../types';

export function getPoints({
  data,
  width,
  height,
  gutter,
  yDomain,
  xDomain,
}: {
  data: TLineChartData;
  width: number;
  height: number;
  gutter: number;
  yDomain: YDomain;
  xDomain?: [number, number];
}): TLineChartRenderPoint[] {
  const timestamps = data.map(({ timestamp }, i) => (xDomain ? timestamp : i));

  const scaleX = scaleLinear()
    .domain(xDomain ?? [Math.min(...timestamps), Math.max(...timestamps)])
    .range([0, width]);

  const scaleY = scaleLinear()
    .domain([yDomain.min, yDomain.max])
    .range([height - gutter, gutter]);

  return data.map((point, index) => ({
    ...point,
    x: scaleX(xDomain ? timestamps[index] ?? index : index),
    y: scaleY(point.value),
  }));
}

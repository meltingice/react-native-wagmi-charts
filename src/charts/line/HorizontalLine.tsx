import { useDerivedValue, withTiming } from 'react-native-reanimated';
import { DashPathEffect, Line, vec } from '@shopify/react-native-skia';

import { LineChartDimensionsContext } from './Chart';
import React from 'react';
import { getXPositionForCurve } from './utils/getXPositionForCurve';
import { useLineChart } from './useLineChart';
import { type CompatibleLineProps, getDashIntervals } from '../skia/compat';
import { getYForX } from './utils';

type HorizontalLineProps = {
  color?: string;
  lineProps?: CompatibleLineProps;
  offsetY?: number;
  /**
   * (Optional) A pixel value to nudge the line up or down.
   *
   * This may be useful to customize the line's position based on the thickness of your cursor or chart path.
   *
   * ```tsx
   * <LineChart.HorizontalLine at={{ index: 3 }} />
   *
   * // or
   *
   * <LineChart.HorizontalLine at={{ value: 320.32 }} />
   * ```
   */
  at?:
    | {
        index: number;
        value?: never;
      }
    | {
        index?: never;
        value: number;
      }
    | number;
};

LineChartHorizontalLine.displayName = 'LineChartHorizontalLine';

export function LineChartHorizontalLine({
  color = 'gray',
  lineProps = {},
  at = { index: 0 },
  offsetY = 0,
}: HorizontalLineProps) {
  const { width, parsedPath, height, gutter } = React.useContext(
    LineChartDimensionsContext
  );
  const { yDomain } = useLineChart();

  const y = useDerivedValue(() => {
    if (typeof at === 'number' || at.index != null) {
      const index = typeof at === 'number' ? at : at.index;
      const yForX =
        getYForX(parsedPath!, getXPositionForCurve(parsedPath, index)) || 0;
      return withTiming(yForX + offsetY);
    }
    /**
     * <gutter>
     * | ---------- | <- yDomain.max  |
     * |            |                 | offsetTop
     * |            | <- value        |
     * |            |
     * |            | <- yDomain.min
     * <gutter>
     */

    const offsetTop = yDomain.max - at.value;
    const percentageOffsetTop = offsetTop / (yDomain.max - yDomain.min);
    const heightBetweenGutters = height - gutter * 2;
    const offsetTopPixels = gutter + percentageOffsetTop * heightBetweenGutters;

    return withTiming(offsetTopPixels + offsetY);
  }, [at, gutter, height, offsetY, parsedPath, yDomain.max, yDomain.min]);
  const dashIntervals = React.useMemo(
    () => getDashIntervals(lineProps.strokeDasharray ?? '3 3'),
    [lineProps.strokeDasharray]
  );
  const p1 = useDerivedValue(() => vec(0, y.value), [y]);
  const p2 = useDerivedValue(() => vec(width, y.value), [width, y]);
  const { strokeDasharray: _strokeDasharray, ...skiaLineProps } = lineProps;

  return (
    <Line
      p1={p1}
      p2={p2}
      color={color}
      strokeWidth={lineProps.strokeWidth ?? 2}
      opacity={lineProps.opacity}
      {...skiaLineProps}
    >
      {dashIntervals && <DashPathEffect intervals={dashIntervals} />}
    </Line>
  );
}

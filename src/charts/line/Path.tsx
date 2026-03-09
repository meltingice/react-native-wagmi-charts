import * as React from 'react';
import { DashPathEffect, Group, Line, vec } from '@shopify/react-native-skia';
import { LineChartDimensionsContext } from './Chart';
import { LineChartPathContext } from './LineChartPathContext';
import type { TLineChartComputedPath } from './types';
import {
  type CompatiblePathProps,
  getDashIntervals,
  getOpacity,
} from '../skia/compat';

export type LineChartPathProps = CompatiblePathProps & {
  color?: string;
  inactiveColor?: string;
  width?: number;
  isInactive?: boolean;
  computedPath?: TLineChartComputedPath;
  /**
   * Default: `true`.
   *
   * If `false`, changes in the chart's path will not animate.
   *
   * While this use case is rare, it may be useful on web, where animations might not work as well.
   *
   ***Example**
   *
   * ```tsx
   * <LineChart.Path
   *   pathProps={{ isTransitionEnabled: Platform.OS !== 'web' }}
   * />
   * ```
   */
  isTransitionEnabled?: boolean;
};

LineChartPath.displayName = 'LineChartPath';

export function LineChartPath({
  color = 'black',
  inactiveColor,
  width: strokeWidth = 3,
  strokeDasharray,
  opacity,
  strokeOpacity,
  strokeLinecap,
  strokeLinejoin,
  strokeMiterlimit,
  computedPath,
  isTransitionEnabled: _isTransitionEnabled,
  isInactive: isInactiveProp,
}: LineChartPathProps) {
  void _isTransitionEnabled;
  void strokeLinejoin;
  void strokeMiterlimit;
  const { parsedPath: contextPath } = React.useContext(LineChartDimensionsContext);
  const { isInactive: contextIsInactive } = React.useContext(LineChartPathContext);
  const points = (computedPath ?? contextPath).points;
  const resolvedInactive = isInactiveProp ?? contextIsInactive;
  const dashIntervals = React.useMemo(
    () => getDashIntervals(strokeDasharray),
    [strokeDasharray]
  );
  const resolvedOpacity = getOpacity(
    {
      opacity,
      strokeOpacity,
    },
    resolvedInactive && !inactiveColor ? 0.2 : 1
  );

  React.useEffect(() => {
    if (!__DEV__) {
      return;
    }

    console.log('[react-native-wagmi-charts][LineChartPath]', {
      pointsLength: points.length,
      strokeWidth,
      color: resolvedInactive ? inactiveColor || color : color,
      opacity: resolvedOpacity,
      dashIntervals,
    });
  }, [color, dashIntervals, inactiveColor, points.length, resolvedInactive, resolvedOpacity, strokeWidth]);

  return (
    <Group>
      {points.slice(1).map((point: TLineChartComputedPath['points'][number], index: number) => {
        const previousPoint = points[index];
        if (!previousPoint) {
          return null;
        }

        return (
          <Line
            key={`${index}-${point.x}-${point.y}`}
            p1={vec(previousPoint.x, previousPoint.y)}
            p2={vec(point.x, point.y)}
            color={resolvedInactive ? inactiveColor || color : color}
            strokeWidth={strokeWidth}
            opacity={resolvedOpacity}
            strokeCap={strokeLinecap}
          >
            {dashIntervals && <DashPathEffect intervals={dashIntervals} />}
          </Line>
        );
      })}
    </Group>
  );
}

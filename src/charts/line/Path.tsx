import * as React from 'react';
import { DashPathEffect, Path } from '@shopify/react-native-skia';
import { LineChartDimensionsContext } from './Chart';
import { LineChartPathContext } from './LineChartPathContext';
import type { TLineChartComputedPath } from './types';
import {
  type CompatiblePathProps,
  getDashIntervals,
  getOpacity,
  makeSkPathFromPoints,
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
  const skPath = React.useMemo(() => makeSkPathFromPoints(points), [points]);
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

  return (
    <Path
      path={skPath}
      style="stroke"
      color={resolvedInactive ? inactiveColor || color : color}
      strokeWidth={strokeWidth}
      opacity={resolvedOpacity}
      strokeCap={strokeLinecap}
    >
      {dashIntervals && <DashPathEffect intervals={dashIntervals} />}
    </Path>
  );
}

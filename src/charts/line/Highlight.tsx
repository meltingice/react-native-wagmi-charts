import * as React from 'react';
import {
  DashPathEffect,
  rect,
  Group,
  Path,
} from '@shopify/react-native-skia';
import { LineChartDimensionsContext } from './Chart';
import { LineChartPathContext } from './LineChartPathContext';
import { getXPositionForCurve } from './utils/getXPositionForCurve';
import {
  type CompatiblePathProps,
  getDashIntervals,
  getOpacity,
  makeSkPathFromPoints,
} from '../skia/compat';
import type { TLineChartComputedPath } from './types';

export type LineChartColorProps = CompatiblePathProps & {
  color?: string;
  from: number;
  to: number;
  showInactiveColor?: boolean;
  inactiveColor?: string;
  width?: number;
  computedPath?: TLineChartComputedPath;
  chartHeight?: number;
  isInactive?: boolean;
};

LineChartHighlight.displayName = 'LineChartHighlight';

export function LineChartHighlight({
  color = 'black',
  inactiveColor,
  showInactiveColor = true,
  from,
  to,
  computedPath,
  chartHeight,
  width: strokeWidth = 3,
  isInactive: isInactiveProp,
  opacity,
  strokeOpacity,
  strokeLinecap,
  strokeLinejoin,
  strokeMiterlimit,
  ...props
}: LineChartColorProps) {
  const { parsedPath: contextPath, height: contextHeight } = React.useContext(
    LineChartDimensionsContext
  );
  const { isInactive: contextIsInactive } = React.useContext(LineChartPathContext);
  const parsedPath = computedPath ?? contextPath;
  const height = chartHeight ?? contextHeight;
  const isInactive = showInactiveColor && (isInactiveProp ?? contextIsInactive);
  const points = parsedPath.points;
  const highlightPath = React.useMemo(
    () => makeSkPathFromPoints(points.slice(from, to + 1)),
    [from, points, to]
  );

  const clipStart = getXPositionForCurve(parsedPath, from);
  const clipEnd = getXPositionForCurve(parsedPath, to);
  const clipRect = React.useMemo(
    () => rect(clipStart, 0, clipEnd - clipStart, height),
    [clipEnd, clipStart, height]
  );
  const resolvedOpacity = getOpacity(
    {
      opacity,
      strokeOpacity,
    },
    isInactive && !inactiveColor ? 0.5 : 1
  );
  const dashIntervals = React.useMemo(
    () => getDashIntervals(props.strokeDasharray),
    [props.strokeDasharray]
  );

  return (
    <Group clip={clipRect}>
      <Path
        path={highlightPath}
        style="stroke"
        color={isInactive ? inactiveColor || color : color}
        strokeWidth={strokeWidth}
        opacity={resolvedOpacity}
        strokeCap={strokeLinecap}
      >
        {dashIntervals && <DashPathEffect intervals={dashIntervals} />}
      </Path>
    </Group>
  );
}

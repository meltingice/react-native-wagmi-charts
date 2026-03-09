import * as React from 'react';
import {
  DashPathEffect,
  rect,
  Group,
  Line,
  vec,
} from '@shopify/react-native-skia';
import { LineChartDimensionsContext } from './Chart';
import { LineChartPathContext } from './LineChartPathContext';
import { getXPositionForCurve } from './utils/getXPositionForCurve';
import {
  type CompatiblePathProps,
  getDashIntervals,
  getOpacity,
} from '../skia/compat';

export type LineChartColorProps = CompatiblePathProps & {
  color?: string;
  from: number;
  to: number;
  showInactiveColor?: boolean;
  inactiveColor?: string;
  width?: number;
};

LineChartHighlight.displayName = 'LineChartHighlight';

export function LineChartHighlight({
  color = 'black',
  inactiveColor,
  showInactiveColor = true,
  from,
  to,
  width: strokeWidth = 3,
  opacity,
  strokeOpacity,
  strokeLinecap,
  strokeLinejoin,
  strokeMiterlimit,
  ...props
}: LineChartColorProps) {
  const { parsedPath, height } = React.useContext(
    LineChartDimensionsContext
  );
  const { isInactive: _isInactive } = React.useContext(LineChartPathContext);
  const isInactive = showInactiveColor && _isInactive;
  const points = parsedPath.points;

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
  const highlightedPoints = React.useMemo(
    () => points.slice(from, to + 1),
    [from, points, to]
  );

  return (
    <Group clip={clipRect}>
      {highlightedPoints.slice(1).map((point, index) => {
        const previousPoint = highlightedPoints[index];
        if (!previousPoint) {
          return null;
        }

        return (
          <Line
            key={`${index}-${point.x}-${point.y}`}
            p1={vec(previousPoint.x, previousPoint.y)}
            p2={vec(point.x, point.y)}
            color={isInactive ? inactiveColor || color : color}
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

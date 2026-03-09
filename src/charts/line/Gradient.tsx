import * as React from 'react';
import {
  LinearGradient,
  Path,
  vec,
} from '@shopify/react-native-skia';
import { LineChartDimensionsContext } from './Chart';
import { LineChartPathContext } from './LineChartPathContext';
import {
  type CompatiblePathProps,
  getGradientStops,
  getOpacity,
  makeSkAreaPathFromPoints,
} from '../skia/compat';
import type { TLineChartComputedPath } from './types';

export type LineChartGradientProps = CompatiblePathProps & {
  color?: string;
  children?: React.ReactNode;
  computedPath?: TLineChartComputedPath;
  chartHeight?: number;
};

LineChartGradient.displayName = 'LineChartGradient';

export function LineChartGradient({
  color: overrideColor = undefined,
  children,
  computedPath,
  chartHeight,
  opacity,
  fillOpacity,
  ...props
}: LineChartGradientProps) {
  const { height: contextHeight, parsedPath: contextPath } =
    React.useContext(LineChartDimensionsContext);
  const { color: contextColor } = React.useContext(LineChartPathContext);
  const color = overrideColor || contextColor;
  const resolvedHeight = chartHeight ?? contextHeight;
  const resolvedPath = computedPath ?? contextPath;
  const skAreaPath = React.useMemo(
    () => makeSkAreaPathFromPoints(resolvedPath.points, resolvedHeight),
    [resolvedHeight, resolvedPath.points]
  );
  const gradientStops = React.useMemo(
    () => getGradientStops(children, color),
    [children, color]
  );
  const resolvedOpacity = getOpacity(
    {
      opacity,
      fillOpacity,
    },
    1
  );

  return (
    <Path path={skAreaPath} opacity={resolvedOpacity} {...props}>
      <LinearGradient
        start={vec(0, 0)}
        end={vec(0, resolvedHeight)}
        colors={gradientStops.map((stop) => stop.color)}
        positions={gradientStops.map((stop) => stop.position)}
      />
    </Path>
  );
}

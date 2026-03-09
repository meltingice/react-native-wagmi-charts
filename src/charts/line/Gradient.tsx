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

export type LineChartGradientProps = CompatiblePathProps & {
  color?: string;
  children?: React.ReactNode;
};

LineChartGradient.displayName = 'LineChartGradient';

export function LineChartGradient({
  color: overrideColor = undefined,
  children,
  opacity,
  fillOpacity,
  ...props
}: LineChartGradientProps) {
  const { height, parsedPath } = React.useContext(LineChartDimensionsContext);
  const { color: contextColor } = React.useContext(LineChartPathContext);
  const color = overrideColor || contextColor;
  const skAreaPath = React.useMemo(
    () => makeSkAreaPathFromPoints(parsedPath.points, height),
    [height, parsedPath.points]
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
        end={vec(0, height)}
        colors={gradientStops.map((stop) => stop.color)}
        positions={gradientStops.map((stop) => stop.position)}
      />
    </Path>
  );
}

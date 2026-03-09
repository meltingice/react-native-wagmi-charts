import React from 'react';
import { StyleSheet } from 'react-native';
import {
  Canvas,
  DashPathEffect,
  Line as SkiaLine,
  vec,
} from '@shopify/react-native-skia';
import {
  type CompatibleLineProps,
  getDashIntervals,
} from '../skia/compat';

export type CandlestickChartLineProps = CompatibleLineProps & {
  color?: string;
  x: number;
  y: number;
};

export const CandlestickChartLine = ({
  color = 'gray',
  x,
  y,
  strokeDasharray = '6 6',
  ...props
}: CandlestickChartLineProps) => {
  const dashIntervals = React.useMemo(
    () => getDashIntervals(strokeDasharray),
    [strokeDasharray]
  );

  return (
    <Canvas style={StyleSheet.absoluteFill}>
      <SkiaLine
        p1={vec(0, 0)}
        p2={vec(x, y)}
        color={color}
        strokeWidth={props.strokeWidth ?? 2}
        {...props}
      >
        {dashIntervals && <DashPathEffect intervals={dashIntervals} />}
      </SkiaLine>
    </Canvas>
  );
};

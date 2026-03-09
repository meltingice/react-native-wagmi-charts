import React from 'react';
import { ColorValue } from 'react-native';
import {
  Group,
  Line,
  Rect,
  RoundedRect,
  vec,
} from '@shopify/react-native-skia';

import type { TCandle, TDomain } from './types';
import { getY, getHeight } from './utils';
import {
  type CompatibleLineProps,
  type CompatiblePathProps,
} from '../skia/compat';

export type CandlestickChartRectProps = CompatiblePathProps & {
  fill?: string;
  rx?: number;
  ry?: number;
};

export type CandlestickChartRenderRectOptions = {
  x: number;
  y: number;
  width: number;
  height: number;
  rawHeight: number;
  fill: ColorValue;
  opacity: number;
  rx?: number;
  ry?: number;
  isPositive: boolean;
  isTiny: boolean;
  useAnimations: boolean;
  candle: TCandle;
};

export type CandlestickChartCandleProps = {
  candle: TCandle;
  domain: TDomain;
  maxHeight: number;
  margin?: number;
  positiveColor?: string;
  negativeColor?: string;
  index: number;
  width: number;
  rectProps?: CandlestickChartRectProps;
  lineProps?: CompatibleLineProps;
  useAnimations?: boolean;
  minBodyHeight?: number;
  renderRect?: (
    renderRectOptions: CandlestickChartRenderRectOptions
  ) => React.ReactNode;
  renderLine?: (renderLineOptions: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    stroke: ColorValue;
    strokeWidth: number;
    useAnimations: boolean;
    candle: TCandle;
  }) => React.ReactNode;
};

export const CandlestickChartCandle = ({
  candle,
  maxHeight,
  domain,
  margin = 2,
  positiveColor = '#10b981',
  negativeColor = '#ef4444',
  rectProps: overrideRectProps,
  lineProps: overrideLineProps,
  index,
  width,
  useAnimations = true,
  minBodyHeight = 0,
  renderLine,
  renderRect,
}: CandlestickChartCandleProps) => {
  const { close, open, high, low } = candle;
  const isPositive = close > open;
  const fill = isPositive ? positiveColor : negativeColor;
  const x = index * width;
  const max = Math.max(open, close);
  const min = Math.min(open, close);

  const lineProps = React.useMemo(
    () => ({
      stroke: fill,
      strokeWidth: 1,
      x1: x + width / 2,
      y1: getY({ maxHeight, value: low, domain }),
      x2: x + width / 2,
      y2: getY({ maxHeight, value: high, domain }),
      candle: candle,
      ...overrideLineProps,
    }),
    [
      domain,
      fill,
      high,
      isPositive,
      low,
      maxHeight,
      overrideLineProps,
      width,
      x,
      candle,
    ]
  );
  const rectProps = React.useMemo(
    () => ({
      width: width - margin * 2,
      fill: fill,
      x: x + margin,
      y: getY({ maxHeight, value: max, domain }),
      height: getHeight({ maxHeight, value: max - min, domain }),
      candle: candle,
      ...overrideRectProps,
    }),
    [
      domain,
      fill,
      isPositive,
      margin,
      max,
      maxHeight,
      min,
      overrideRectProps,
      width,
      x,
      candle,
    ]
  );
  const rawHeight = Number(rectProps.height) || 0;
  const isTiny = rawHeight < minBodyHeight;
  const adjustedHeight = isTiny ? minBodyHeight : rawHeight;
  const adjustedY = isTiny
    ? Number(rectProps.y) - (minBodyHeight - rawHeight) / 2
    : Number(rectProps.y);
  const rectOptions: CandlestickChartRenderRectOptions = {
    x: Number(rectProps.x),
    y: adjustedY,
    width: Number(rectProps.width),
    height: adjustedHeight,
    rawHeight,
    fill: rectProps.fill,
    opacity: typeof rectProps.opacity === 'number' ? rectProps.opacity : 1,
    rx: rectProps.rx,
    ry: rectProps.ry,
    isPositive,
    isTiny,
    useAnimations,
    candle,
  };

  if (renderLine || renderRect) {
    return (
      <>
        {(renderLine ?? (() => null))({
          ...lineProps,
          useAnimations,
        })}
        {(renderRect ?? (() => null))(rectOptions)}
      </>
    );
  }

  const radiusX = rectProps.rx ?? 0;
  const radiusY = rectProps.ry ?? 0;
  const hasRoundedCorners = radiusX > 0 || radiusY > 0;

  return (
    <Group>
      <Line
        p1={vec(lineProps.x1, lineProps.y1)}
        p2={vec(lineProps.x2, lineProps.y2)}
        color={String(lineProps.stroke)}
        strokeWidth={lineProps.strokeWidth}
        opacity={lineProps.opacity}
      />
      {hasRoundedCorners ? (
        <RoundedRect
          x={rectOptions.x}
          y={rectOptions.y}
          width={rectOptions.width}
          height={rectOptions.height}
          r={vec(radiusX, radiusY)}
          color={String(rectOptions.fill)}
          opacity={rectOptions.opacity}
        />
      ) : (
        <Rect
          x={rectOptions.x}
          y={rectOptions.y}
          width={rectOptions.width}
          height={rectOptions.height}
          color={String(rectOptions.fill)}
          opacity={rectOptions.opacity}
        />
      )}
    </Group>
  );
};

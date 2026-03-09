import React from 'react';
import { Canvas } from '@shopify/react-native-skia';
import { ViewProps } from 'react-native';

import { CandlestickChartDimensionsContext } from './Chart';
import { CandlestickChartCandle, CandlestickChartCandleProps } from './Candle';
import { useCandlestickChart } from './useCandlestickChart';

type CandlestickChartCandlesProps = ViewProps & {
  width?: number;
  height?: number;
  margin?: CandlestickChartCandleProps['margin'];
  minBodyHeight?: CandlestickChartCandleProps['minBodyHeight'];
  positiveColor?: CandlestickChartCandleProps['positiveColor'];
  negativeColor?: CandlestickChartCandleProps['negativeColor'];
  renderRect?: CandlestickChartCandleProps['renderRect'];
  renderLine?: CandlestickChartCandleProps['renderLine'];
  rectProps?: CandlestickChartCandleProps['rectProps'];
  lineProps?: CandlestickChartCandleProps['lineProps'];
  candleProps?: Partial<CandlestickChartCandleProps>;
  useAnimations?: boolean;
};

export function CandlestickChartCandles({
  positiveColor,
  negativeColor,
  rectProps,
  lineProps,
  margin,
  minBodyHeight,
  useAnimations = true,
  renderRect,
  renderLine,
  candleProps,
  ...props
}: CandlestickChartCandlesProps) {
  const { width, height } = React.useContext(CandlestickChartDimensionsContext);
  const { data, domain, step } = useCandlestickChart();

  return (
    <Canvas style={[{ width, height }, props.style]}>
      {step > 0 &&
        data.map((candle, index) => (
          <CandlestickChartCandle
            key={index as React.Key}
            domain={domain}
            margin={margin}
            minBodyHeight={minBodyHeight}
            maxHeight={height}
            width={step}
            positiveColor={positiveColor}
            negativeColor={negativeColor}
            renderRect={renderRect}
            renderLine={renderLine}
            rectProps={rectProps}
            lineProps={lineProps}
            useAnimations={useAnimations}
            candle={candle}
            index={index}
            {...candleProps}
          />
        ))}
    </Canvas>
  );
}

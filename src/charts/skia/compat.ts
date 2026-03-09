import React from 'react';
import { processColor } from 'react-native';
import { Skia } from '@shopify/react-native-skia';
import { svgPathProperties } from 'svg-path-properties';

export type CompatibleStrokeProps = {
  opacity?: number;
  strokeOpacity?: number;
  fillOpacity?: number;
  strokeWidth?: number;
  strokeDasharray?: number[] | string;
  strokeLinecap?: 'butt' | 'round' | 'square';
  strokeLinejoin?: 'miter' | 'round' | 'bevel';
  strokeMiterlimit?: number;
};

export type CompatiblePathProps = CompatibleStrokeProps;

export type CompatibleLineProps = CompatibleStrokeProps;

export type CompatibleCircleProps = CompatibleStrokeProps & {
  r?: number;
  fill?: string;
  color?: string;
};

type GradientStop = {
  color: string;
  position: number;
};

const MIN_PATH_SAMPLE_COUNT = 60;

function parseNumericValue(value: number | string | undefined, fallback: number) {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    if (value.trim().endsWith('%')) {
      const numericValue = Number(value.replace('%', ''));
      return Number.isNaN(numericValue) ? fallback : numericValue / 100;
    }

    const numericValue = Number(value);
    return Number.isNaN(numericValue) ? fallback : numericValue;
  }

  return fallback;
}

function applyOpacityToColor(color: string, opacity: number) {
  const processedColor = processColor(color);

  if (typeof processedColor !== 'number') {
    return color;
  }

  const normalizedColor = processedColor >>> 0;
  const red = (normalizedColor >> 16) & 255;
  const green = (normalizedColor >> 8) & 255;
  const blue = normalizedColor & 255;

  return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
}

export function getOpacity(
  props: {
    opacity?: number;
    strokeOpacity?: number;
    fillOpacity?: number;
  },
  fallback = 1
) {
  const values = [props.opacity, props.strokeOpacity, props.fillOpacity].filter(
    (value): value is number => typeof value === 'number'
  );

  if (!values.length) {
    return fallback;
  }

  return values.reduce((product, value) => product * value, 1);
}

export function getDashIntervals(strokeDasharray?: number[] | string) {
  if (!strokeDasharray) {
    return undefined;
  }

  if (Array.isArray(strokeDasharray)) {
    return strokeDasharray.map(Number).filter((value) => !Number.isNaN(value));
  }

  return strokeDasharray
    .split(/[ ,]+/)
    .map((value) => Number(value))
    .filter((value) => !Number.isNaN(value));
}

export function getGradientStops(
  children: React.ReactNode,
  fallbackColor: string
): GradientStop[] {
  const elements = React.Children.toArray(children) as Array<
    React.ReactElement<{
      offset?: number | string;
      stopColor?: string;
      stopOpacity?: number;
      color?: string;
      opacity?: number;
    }>
  >;

  if (!elements.length) {
    return [
      { color: applyOpacityToColor(fallbackColor, 0.15), position: 0.2 },
      { color: applyOpacityToColor(fallbackColor, 0.05), position: 0.4 },
      { color: applyOpacityToColor(fallbackColor, 0), position: 1 },
    ];
  }

  return elements.map((element, index) => {
    const stopColor = element.props.stopColor ?? element.props.color ?? fallbackColor;
    const stopOpacity = parseNumericValue(
      element.props.stopOpacity ?? element.props.opacity,
      1
    );
    return {
      color: applyOpacityToColor(stopColor, stopOpacity),
      position: parseNumericValue(
        element.props.offset,
        elements.length === 1 ? 1 : index / (elements.length - 1)
      ),
    };
  });
}

export function makeSkPathFromSvg(svgPath: string) {
  const path = Skia.Path.Make();

  if (!svgPath) {
    return path;
  }

  const properties = new svgPathProperties(svgPath);
  const length = properties.getTotalLength();
  const sampleCount = Math.max(
    MIN_PATH_SAMPLE_COUNT,
    Math.ceil(length / 2)
  );

  for (let index = 0; index <= sampleCount; index += 1) {
    const sampleLength = sampleCount === 0 ? 0 : (length * index) / sampleCount;
    const { x, y } = properties.getPointAtLength(sampleLength);

    if (index === 0) {
      path.moveTo(x, y);
    } else {
      path.lineTo(x, y);
    }
  }

  return path;
}

export function makeSkPathFromPoints(
  points: Array<{
    x: number;
    y: number;
  }>
) {
  const path = Skia.Path.Make();

  if (!points.length) {
    return path;
  }

  points.forEach((point, index) => {
    if (index === 0) {
      path.moveTo(point.x, point.y);
    } else {
      path.lineTo(point.x, point.y);
    }
  });

  return path;
}

export function makeSkAreaPathFromPoints(
  points: Array<{
    x: number;
    y: number;
  }>,
  height: number
) {
  const path = Skia.Path.Make();

  if (!points.length) {
    return path;
  }

  points.forEach((point, index) => {
    if (index === 0) {
      path.moveTo(point.x, point.y);
    } else {
      path.lineTo(point.x, point.y);
    }
  });

  const lastPoint = points[points.length - 1]!;
  const firstPoint = points[0]!;
  path.lineTo(lastPoint.x, height);
  path.lineTo(firstPoint.x, height);
  path.close();

  return path;
}

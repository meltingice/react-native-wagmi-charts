import React from 'react';

import {
  Circle,
} from '@shopify/react-native-skia';
import {
  Easing,
  useDerivedValue,
  withRepeat,
  withSequence,
  withTiming,
  AnimatedProps,
} from 'react-native-reanimated';

import { LineChartDimensionsContext } from './Chart';
import { LineChartPathContext } from './LineChartPathContext';
import type { TLineChartComputedPath } from './types';
import { useLineChart } from './useLineChart';
import { type CompatibleCircleProps } from '../skia/compat';

export type LineChartDotProps = {
  dotProps?: AnimatedProps<CompatibleCircleProps>;
  outerDotProps?: AnimatedProps<CompatibleCircleProps>;
  color?: string;
  inactiveColor?: string;
  showInactiveColor?: boolean;
  at: number;
  computedPath?: TLineChartComputedPath;
  renderOffset?: {
    x: number;
    y: number;
  };
  isInactive?: boolean;
  size?: number;
  hasPulse?: boolean;
  hasOuterDot?: boolean;
  /**
   * If `always`, the outer dot will still animate when interaction is active.
   *
   * If `while-inactive`, the outer dot will animate only when the interaction is inactive.
   *
   * Default: `while-inactive`
   */
  pulseBehaviour?: 'always' | 'while-inactive';
  /**
   * Defaults to `size * 4`
   */
  outerSize?: number;
  pulseDurationMs?: number;
};

LineChartDot.displayName = 'LineChartDot';

export function LineChartDot({
  at,
  color: defaultColor = 'black',
  computedPath,
  renderOffset,
  dotProps,
  hasOuterDot: defaultHasOuterDot = false,
  hasPulse = false,
  inactiveColor,
  outerDotProps,
  pulseBehaviour = 'while-inactive',
  pulseDurationMs = 800,
  showInactiveColor = true,
  isInactive: isInactiveProp,
  size = 4,
  outerSize = size * 4,
}: LineChartDotProps) {
  const { isActive } = useLineChart();
  const { parsedPath: contextPath } = React.useContext(LineChartDimensionsContext);
  const points = (computedPath ?? contextPath).points ?? [];
  const point = points[at];

  ////////////////////////////////////////////////////////////

  const { isInactive: contextIsInactive } = React.useContext(LineChartPathContext);
  const isInactive = showInactiveColor && (isInactiveProp ?? contextIsInactive);
  const color = isInactive ? inactiveColor || defaultColor : defaultColor;
  const opacity = isInactive && !inactiveColor ? 0.5 : 1;
  const hasOuterDot = defaultHasOuterDot || hasPulse;
  const offsetX = renderOffset?.x ?? 0;
  const offsetY = renderOffset?.y ?? 0;

  ////////////////////////////////////////////////////////////

  const outerOpacity = useDerivedValue(() => {
    const defaultOpacity = 0.1;

    if (!hasPulse) {
      return defaultOpacity;
    }

    if (isActive.value && pulseBehaviour === 'while-inactive') {
      return 0;
    }

    const easing = Easing.out(Easing.sin);
    const animatedOpacity = withRepeat(
      withSequence(
        withTiming(0),
        withTiming(0.8),
        withTiming(0, {
          duration: pulseDurationMs,
          easing,
        })
      ),
      -1,
      false
    );

    if (pulseBehaviour === 'while-inactive') {
      return isActive.value ? withTiming(0) : animatedOpacity;
    }

    return animatedOpacity;
  }, [hasPulse, isActive, pulseBehaviour, pulseDurationMs]);
  const outerRadius = useDerivedValue(() => {
    const defaultRadius = outerSize;

    if (!hasPulse) {
      return defaultRadius;
    }

    if (isActive.value && pulseBehaviour === 'while-inactive') {
      return 0;
    }

    const easing = Easing.out(Easing.sin);
    const scale = withRepeat(
      withSequence(
        withTiming(0),
        withTiming(0),
        withTiming(outerSize, {
          duration: pulseDurationMs,
          easing,
        })
      ),
      -1,
      false
    );

    if (pulseBehaviour === 'while-inactive') {
      return isActive.value ? withTiming(0) : scale;
    }
    return scale;
  }, [hasPulse, isActive, outerSize, pulseBehaviour, pulseDurationMs]);
  const resolvedOpacity =
    typeof dotProps?.opacity === 'number' ? dotProps.opacity : opacity;

  ////////////////////////////////////////////////////////////

  return (
    <>
      <Circle
        cx={(point?.x ?? 0) + offsetX}
        cy={(point?.y ?? 0) + offsetY}
        r={typeof dotProps?.r === 'number' ? dotProps.r : size}
        color={dotProps?.color ?? dotProps?.fill ?? color}
        opacity={resolvedOpacity}
      />
      {hasOuterDot && (
        <Circle
          cx={(point?.x ?? 0) + offsetX}
          cy={(point?.y ?? 0) + offsetY}
          r={typeof outerDotProps?.r === 'number' ? outerDotProps.r : outerRadius}
          opacity={outerOpacity}
          color={
            outerDotProps?.color ?? outerDotProps?.fill ?? color
          }
        />
      )}
    </>
  );
}

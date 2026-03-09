import React from 'react';
import { Canvas } from '@shopify/react-native-skia';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  WithTimingConfig,
} from 'react-native-reanimated';
import flattenChildren from 'react-keyed-flatten-children';

import { LineChartDimensionsContext } from './Chart';
import { LineChartPathContext } from './LineChartPathContext';
import { LineChartPath, LineChartPathProps } from './Path';
import { useLineChart } from './useLineChart';
import type { TLineChartComputedPath, TLineChartRenderPoint } from './types';
import { usePrevious } from '../../utils';

const BACKGROUND_COMPONENTS = [
  'LineChartHighlight',
  'LineChartHorizontalLine',
  'LineChartGradient',
];
const FOREGROUND_COMPONENTS = ['LineChartHighlight'];
const DOT_COMPONENTS = ['LineChartDot'];
const OVERLAY_COMPONENTS = ['LineChartTooltip'];
const DOT_CANVAS_PADDING = 64;

type ReactElementWithDisplayName = React.ReactElement & {
  type?: {
    displayName?: string;
  };
};
type DrawableLineChartElement = React.ReactElement<Record<string, unknown>>;

function buildComputedPath(
  basePath: TLineChartComputedPath,
  points: TLineChartRenderPoint[]
): TLineChartComputedPath {
  return {
    ...basePath,
    move: points[0]
      ? {
          x: points[0].x,
          y: points[0].y,
        }
      : basePath.move,
    curves: points.slice(1).map((point) => ({
      to: {
        x: point.x,
        y: point.y,
      },
    })),
    points,
  };
}

type LineChartPathWrapperProps = {
  animationDuration?: number;
  animationProps?: Omit<Partial<WithTimingConfig>, 'duration'>;
  children?: React.ReactNode;
  color?: string;
  inactiveColor?: string;
  width?: number;
  widthOffset?: number;
  pathProps?: Partial<LineChartPathProps>;
  showInactivePath?: boolean;
  animateOnMount?: 'foreground';
  mountAnimationDuration?: number;
  mountAnimationProps?: Partial<WithTimingConfig>;
};

LineChartPathWrapper.displayName = 'LineChartPathWrapper';

export function LineChartPathWrapper({
  animationDuration = 300,
  animationProps = {},
  children,
  color = 'black',
  inactiveColor,
  width: strokeWidth = 3,
  widthOffset = 20,
  pathProps = {},
  showInactivePath = true,
  animateOnMount,
  mountAnimationDuration = animationDuration,
  mountAnimationProps = animationProps,
}: LineChartPathWrapperProps) {
  const { height, width, parsedPath, gutter } = React.useContext(LineChartDimensionsContext);
  const { currentX, isActive, yDomain } = useLineChart();
  const previousParsedPath = usePrevious(parsedPath);
  const isMounted = useSharedValue(false);
  const hasMountedAnimation = useSharedValue(false);
  const isTransitionEnabled = pathProps.isTransitionEnabled ?? true;
  const [displayPath, setDisplayPath] = React.useState(parsedPath);

  React.useEffect(() => {
    isMounted.value = true;
    return () => {
      isMounted.value = false;
    };
  }, []);

  React.useEffect(() => {
    const previousPoints = previousParsedPath?.points ?? [];
    const nextPoints = parsedPath.points;

    if (
      !isTransitionEnabled ||
      previousPoints.length === 0 ||
      previousPoints.length !== nextPoints.length
    ) {
      setDisplayPath(parsedPath);
      return;
    }

    const duration = animationDuration;
    const easing =
      typeof animationProps.easing === 'function'
        ? animationProps.easing
        : (value: number) => value;

    let frameId = 0;
    const startTime = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const rawProgress = duration === 0 ? 1 : Math.min(elapsed / duration, 1);
      const progress = easing(rawProgress);

      const interpolatedPoints = nextPoints.map((point, index) => {
        const previousPoint = previousPoints[index] ?? point;

        return {
          ...point,
          x: previousPoint.x + (point.x - previousPoint.x) * progress,
          y: previousPoint.y + (point.y - previousPoint.y) * progress,
        };
      });

      setDisplayPath(buildComputedPath(parsedPath, interpolatedPoints));

      if (rawProgress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [animationDuration, animationProps.easing, isTransitionEnabled, parsedPath, previousParsedPath]);

  const viewSize = React.useMemo(() => ({ width, height }), [width, height]);
  const foregroundClipStyle = useAnimatedStyle(() => {
    const shouldAnimateOnMount = animateOnMount === 'foreground';
    const inactiveWidth =
      !isMounted.value && shouldAnimateOnMount ? 0 : width;

    let duration =
      shouldAnimateOnMount && !hasMountedAnimation.value
        ? mountAnimationDuration
        : animationDuration;
    const props =
      shouldAnimateOnMount && !hasMountedAnimation.value
        ? mountAnimationProps
        : animationProps;

    if (isActive.value) {
      duration = 0;
    }

    return {
      width: withTiming(
        isActive.value
          ? Math.max(currentX.value, 0)
          : inactiveWidth + widthOffset,
        Object.assign({ duration }, props),
        () => {
          hasMountedAnimation.value = true;
        }
      ),
      overflow: 'hidden',
    };
  }, [
    animateOnMount,
    animationDuration,
    animationProps,
    currentX,
    hasMountedAnimation,
    isActive,
    isMounted,
    mountAnimationDuration,
    mountAnimationProps,
    width,
    widthOffset,
  ]);

  ////////////////////////////////////////////////

  const enhanceChild = React.useCallback(
    (child: React.ReactNode, isInactive: boolean) => {
      if (!React.isValidElement(child)) {
        return child;
      }

      const childDisplayName =
        (child as ReactElementWithDisplayName)?.type?.displayName || '';

      if (
        ![
          'LineChartDot',
          'LineChartGradient',
          'LineChartHighlight',
          'LineChartHorizontalLine',
        ].includes(childDisplayName)
      ) {
        return child;
      }

      if (childDisplayName === 'LineChartDot') {
        return React.cloneElement(child as DrawableLineChartElement, {
          computedPath: displayPath,
        });
      }

      if (childDisplayName === 'LineChartGradient') {
        return React.cloneElement(child as DrawableLineChartElement, {
          computedPath: displayPath,
          chartHeight: height,
        });
      }

      if (childDisplayName === 'LineChartHighlight') {
        return React.cloneElement(child as DrawableLineChartElement, {
          computedPath: displayPath,
          chartHeight: height,
          isInactive,
        });
      }

      return React.cloneElement(child as DrawableLineChartElement, {
        computedPath: displayPath,
        chartHeight: height,
        chartWidth: width,
        gutter,
        yDomain,
      });
    },
    [displayPath, gutter, height, width, yDomain]
  );

  let backgroundChildren;
  let foregroundChildren;
  let dotChildren;
  let overlayChildren;
  if (children) {
    const iterableChildren = flattenChildren(children);
    backgroundChildren = iterableChildren
      .filter(
        (child) =>
          BACKGROUND_COMPONENTS.includes(
            (child as ReactElementWithDisplayName)?.type?.displayName || ''
          )
      )
      .map((child) => enhanceChild(child, showInactivePath));
    dotChildren = iterableChildren
      .filter(
        (child) =>
          DOT_COMPONENTS.includes(
            (child as ReactElementWithDisplayName)?.type?.displayName || ''
          )
      )
      .map((child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as DrawableLineChartElement, {
              computedPath: displayPath,
              renderOffset: {
                x: DOT_CANVAS_PADDING,
                y: DOT_CANVAS_PADDING,
              },
              isInactive: false,
            })
          : child
      );
    foregroundChildren = iterableChildren
      .filter(
      (child) =>
        FOREGROUND_COMPONENTS.includes(
          (child as ReactElementWithDisplayName)?.type?.displayName || ''
        )
      )
      .map((child) => enhanceChild(child, false));
    overlayChildren = iterableChildren.filter((child) =>
      OVERLAY_COMPONENTS.includes(
        (child as ReactElementWithDisplayName)?.type?.displayName || ''
      )
    );
  }

  ////////////////////////////////////////////////

  return (
    <>
      <LineChartPathContext.Provider
        value={{
          color,
          isInactive: showInactivePath,
          isTransitionEnabled,
        }}
      >
        <View style={viewSize}>
          <Canvas style={viewSize}>
            <LineChartPath
              color={color}
              inactiveColor={inactiveColor}
              computedPath={displayPath}
              isInactive={showInactivePath}
              width={strokeWidth}
              {...pathProps}
            />
            {backgroundChildren}
          </Canvas>
          <Canvas
            style={{
              ...styles.dotCanvas,
              left: -DOT_CANVAS_PADDING,
              top: -DOT_CANVAS_PADDING,
              width: width + DOT_CANVAS_PADDING * 2,
              height: height + DOT_CANVAS_PADDING * 2,
            }}
          >
            {dotChildren}
          </Canvas>
          <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            {overlayChildren}
          </View>
        </View>
      </LineChartPathContext.Provider>
      <LineChartPathContext.Provider
        value={{
          color,
          isInactive: false,
          isTransitionEnabled,
        }}
      >
        <View style={StyleSheet.absoluteFill}>
          <Animated.View style={[viewSize, foregroundClipStyle]}>
            <Canvas style={viewSize}>
              <LineChartPath
                color={color}
                computedPath={displayPath}
                isInactive={false}
                width={strokeWidth}
                {...pathProps}
              />
              {foregroundChildren}
            </Canvas>
          </Animated.View>
        </View>
      </LineChartPathContext.Provider>
    </>
  );
}

const styles = StyleSheet.create({
  dotCanvas: {
    position: 'absolute',
  },
});

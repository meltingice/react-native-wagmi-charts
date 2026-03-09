import React from 'react';
import { Canvas } from '@shopify/react-native-skia';
import { StyleSheet, View } from 'react-native';
import flattenChildren from 'react-keyed-flatten-children';

import { LineChartDimensionsContext } from './Chart';
import { LineChartPathContext } from './LineChartPathContext';
import { LineChartPath, LineChartPathProps } from './Path';
const OVERLAY_COMPONENTS = ['LineChartTooltip'];

type ReactElementWithDisplayName = React.ReactElement & {
  type?: {
    displayName?: string;
  };
};

type LineChartPathWrapperProps = {
  children?: React.ReactNode;
  color?: string;
  inactiveColor?: string;
  width?: number;
  pathProps?: Partial<LineChartPathProps>;
  showInactivePath?: boolean;
};

LineChartPathWrapper.displayName = 'LineChartPathWrapper';

export function LineChartPathWrapper({
  children,
  color = 'black',
  inactiveColor,
  width: strokeWidth = 3,
  pathProps = {},
  showInactivePath: _showInactivePath = true,
}: LineChartPathWrapperProps) {
  const { height, width, parsedPath } = React.useContext(LineChartDimensionsContext);

  const viewSize = React.useMemo(() => ({ width, height }), [width, height]);

  ////////////////////////////////////////////////

  let drawableChildren;
  let overlayChildren;
  if (children) {
    const iterableChildren = flattenChildren(children);
    drawableChildren = iterableChildren
      .filter(
      (child) =>
        !OVERLAY_COMPONENTS.includes(
          (child as ReactElementWithDisplayName)?.type?.displayName || ''
        )
      )
      .map((child) => {
        const childDisplayName =
          (child as ReactElementWithDisplayName)?.type?.displayName || '';

        if (
          childDisplayName === 'LineChartDot' &&
          React.isValidElement(child)
        ) {
          return React.cloneElement(child as React.ReactElement<any>, {
            computedPath: parsedPath,
          });
        }

        return child;
      });
    overlayChildren = iterableChildren.filter((child) =>
      OVERLAY_COMPONENTS.includes(
        (child as ReactElementWithDisplayName)?.type?.displayName || ''
      )
    );
  }

  ////////////////////////////////////////////////

  return (
    <LineChartPathContext.Provider
      value={{
        color,
        isInactive: false,
        isTransitionEnabled: pathProps.isTransitionEnabled ?? true,
      }}
    >
      <View style={viewSize}>
        <Canvas style={viewSize}>
          <LineChartPath
            color={color}
            inactiveColor={inactiveColor}
            computedPath={parsedPath}
            isInactive={false}
            width={strokeWidth}
            {...pathProps}
          />
          {drawableChildren}
        </Canvas>
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          {overlayChildren}
        </View>
      </View>
    </LineChartPathContext.Provider>
  );
}

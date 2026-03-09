import { useContext } from 'react';
import { useDerivedValue } from 'react-native-reanimated';
import { LineChartContext } from './Context';
import { LineChartDimensionsContext } from './Chart';
import { getYForX } from './utils';

export function useCurrentY() {
  const { width, parsedPath } = useContext(LineChartDimensionsContext);
  const { currentX } = useContext(LineChartContext);

  const currentY = useDerivedValue(() => {
    if (parsedPath.points.length === 0) {
      return -1;
    }
    const boundedX = Math.min(width, currentX.value);
    return getYForX(parsedPath, boundedX) || 0;
  }, [currentX, parsedPath, width]);

  return currentY;
}

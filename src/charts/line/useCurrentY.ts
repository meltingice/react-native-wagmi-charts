import { useContext } from 'react';
import { useDerivedValue } from 'react-native-reanimated';
import { LineChartContext } from './Context';
import { LineChartDimensionsContext } from './Chart';
import { getYForX } from './utils';

export function useCurrentY() {
  const { path, width } = useContext(LineChartDimensionsContext);
  const { currentX } = useContext(LineChartContext);
  const { parsedPath } = useContext(LineChartDimensionsContext);

  const currentY = useDerivedValue(() => {
    if (!path || parsedPath.points.length === 0) {
      return -1;
    }
    const boundedX = Math.min(width, currentX.value);
    return getYForX(parsedPath, boundedX) || 0;
  }, [currentX, parsedPath, path, width]);

  return currentY;
}

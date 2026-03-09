import {
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { usePrevious } from '../../utils';
import { interpolatePath } from './utils';

export function useAnimatedSkiaPath({
  enabled = true,
  path,
}: {
  enabled?: boolean;
  path: string;
}) {
  const transition = useSharedValue(1);
  const previousPath = usePrevious(path);

  useAnimatedReaction(
    () => path,
    (currentPath, previousValue) => {
      if (currentPath !== previousValue) {
        transition.value = 0;
        transition.value = withTiming(1);
      }
    },
    [path]
  );

  return useDerivedValue(() => {
    if (!previousPath || !enabled) {
      return path || '';
    }

    const pathInterpolator = interpolatePath(previousPath, path, null);
    return pathInterpolator(transition.value);
  }, [enabled, path, previousPath, transition]);
}

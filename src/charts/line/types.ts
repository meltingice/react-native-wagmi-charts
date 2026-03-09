import type { SharedValue } from 'react-native-reanimated';

export type TLineChartPoint = {
  timestamp: number;
  value: number;
};
export type TLineChartDataProp =
  | TLineChartData
  | {
      [key: string]: TLineChartData;
    };
export type TLineChartData = Array<TLineChartPoint>;
export type TLineChartRenderPoint = TLineChartPoint & {
  x: number;
  y: number;
};
export type TLineChartPathCurve = {
  to: {
    x: number;
    y: number;
  };
};
export type TLineChartPathSample = {
  x: number;
  y: number;
  progress: number;
  length: number;
};
export type TLineChartComputedPath = {
  move: {
    x: number;
    y: number;
  };
  curves: TLineChartPathCurve[];
  points: TLineChartRenderPoint[];
  samples: TLineChartPathSample[];
  length: number;
};
export type TLineChartContext = {
  currentX: SharedValue<number>;
  currentIndex: SharedValue<number>;
  isActive: SharedValue<boolean>;
  domain: [number, number];
  yDomain: YDomain;
  xLength: number;
  xDomain?: [number, number] | undefined;
};

export type YRangeProp = {
  min?: number;
  max?: number;
};

export type YDomain = {
  min: number;
  max: number;
};

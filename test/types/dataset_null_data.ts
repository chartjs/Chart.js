import type { ChartDataset } from '../../src/types.js';

const dataset: ChartDataset = {
  data: [10, null, 20],
};

const lineDataset: ChartDataset<'line'> = {
  data: [10, null, 20],
};
const scatterDataset: ChartDataset<'scatter'> = {
  data: [10, null, 20],
};
const radarDataset: ChartDataset<'radar'> = {
  data: [10, null, 20],
};

// [number, number] tuple data must be accepted for line and scatter, matching bar's floating-range behaviour
const lineTupleDataset: ChartDataset<'line'> = {
  data: [[1, 2], [3, 4], [5, 6]],
};
const scatterTupleDataset: ChartDataset<'scatter'> = {
  data: [[1, 2], [3, 4], [5, 6]],
};


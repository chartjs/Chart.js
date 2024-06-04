import type { ChartOptions } from '../../../src/types.js';

const chartOptions: ChartOptions<'line'> = {
  scales: {
    x: {
      type: 'time',
      time: {
        unit: 'year'
      }
    },
  }
};

import { ChartOptions } from '../../../src/types';

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

import { ChartOptions } from '../..';

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

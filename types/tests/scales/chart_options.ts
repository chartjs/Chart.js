import { ChartOptions } from '../../index.esm';

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

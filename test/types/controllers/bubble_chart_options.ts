import { Chart, ChartOptions } from '../../../src/types.js';

const chart = new Chart('test', {
  type: 'bubble',
  data: {
    datasets: []
  },
  options: {
    scales: {
      x: {
        min: 0,
        max: 30,
        ticks: {}
      },
      y: {
        min: 0,
        max: 30,
        ticks: {},
      },
    }
  }
});

import { Chart } from '../../../src/types.js';

const chart = new Chart('id', {
  type: 'line',
  data: {
    datasets: [
      {
        label: 'Cats',
        data: [],
      }
    ]
  },
  options: {
    elements: {
      line: {
        spanGaps: true
      }
    },
    scales: {
      x: {
        type: 'linear',
        min: 1,
        max: 10
      },
      y: {
        type: 'linear',
        min: 0,
        max: 50
      }
    }
  }
});

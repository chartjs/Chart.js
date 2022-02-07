import { Chart } from '../../index.esm';

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

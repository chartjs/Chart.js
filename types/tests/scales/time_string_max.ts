import { Chart } from '../../../src/types.js';

const chart = new Chart('id', {
  type: 'line',
  data: {
    datasets: [
      {
        label: 'Pie',
        data: [
        ],
        borderColor: '#000000',
        backgroundColor: '#00FF00'
      }
    ]
  },
  options: {
    scales: {
      x: {
        type: 'time',
        min: '2021-01-01',
        max: '2021-12-01'
      },
      y: {
        type: 'linear',
        min: 0,
        max: 10
      }
    }
  }
});

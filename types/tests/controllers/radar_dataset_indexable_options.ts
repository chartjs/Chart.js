import { Chart, ChartOptions } from '../../index.esm';

const chart = new Chart('test', {
  type: 'radar',
  data: {
    labels: ['a', 'b', 'c'],
    datasets: [{
      data: [1, 2, 3],
      backgroundColor: ['red', 'green', 'blue'],
      borderColor: ['red', 'green', 'blue'],
      hoverRadius: [1, 2, 3],
      pointBackgroundColor: ['red', 'green', 'blue'],
      pointBorderColor: ['red', 'green', 'blue'],
      pointBorderWidth: [1, 2, 3],
      pointHitRadius: [1, 2, 3],
      pointHoverBackgroundColor: ['red', 'green', 'blue'],
      pointHoverBorderColor: ['red', 'green', 'blue'],
      pointHoverBorderWidth: [1, 2, 3],
      pointHoverRadius: [1, 2, 3],
      pointRadius: [1, 2, 3],
      pointRotation: [1, 2, 3],
      pointStyle: ['circle', 'cross', 'crossRot'],
      radius: [1, 2, 3],
    }]
  },
});

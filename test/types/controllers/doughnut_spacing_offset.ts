import { Chart, ChartMeta, Element } from '../../../src/types.js';

const chart = new Chart('id', {
  type: 'doughnut',
  data: {
    datasets: [{
      data: [10, 20, 40, 50, 5],
      label: 'Dataset 1',
      backgroundColor: [
        'red',
        'orange',
        'yellow',
        'green',
        'blue'
      ]
    }],
    labels: [
      'Item 1',
      'Item 2',
      'Item 3',
      'Item 4',
      'Item 5'
    ],
  },
  options: {
    spacing: 50,
    offset: [0, 50, 0, 0, 0],
  }
});

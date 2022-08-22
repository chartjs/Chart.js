import { Chart } from '../../../src/types';

const chart = new Chart('id', {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: ['red', 'blue'],
      hoverBackgroundColor: ['red', 'blue'],
    }]
  },
});

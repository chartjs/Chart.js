import { Chart } from '../../../src/types.js';

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

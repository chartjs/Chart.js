import { Chart } from '../../index.esm';

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

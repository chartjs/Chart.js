import { Chart } from '../../../../src/types.js';

const chart = new Chart('id', {
  type: 'bar',
  data: {
    labels: [],
    datasets: [{
      data: []
    }]
  },
  options: {
    plugins: {
      tooltip: {
        backgroundColor: (ctx) => 'black',
      }
    }
  },
});

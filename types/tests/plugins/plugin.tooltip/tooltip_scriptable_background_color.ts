import { Chart } from '../../../index.esm';

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

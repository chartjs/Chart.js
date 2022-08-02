import { Chart } from '../../..';

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

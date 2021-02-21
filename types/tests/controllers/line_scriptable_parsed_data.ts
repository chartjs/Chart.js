import { Chart } from '../../index.esm';

const chart = new Chart('id', {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: (context) => {
        return context.parsed.y > 10 ? 'green' : 'red';
      }
    }]
  },
});

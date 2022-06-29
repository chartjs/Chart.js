import { Chart } from '../../index.esm';

const chart = new Chart('id', {
  type: 'bar',
  data: {
    labels: [],
    datasets: [{
      data: [{ x: 1, y: 2, color: 'red' }],
      backgroundColor: (context) => {
        return context.raw.color;
      }
    }]
  },
});

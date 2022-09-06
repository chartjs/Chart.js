import { Chart } from '../../../src/types';

const chart = new Chart('id', {
  type: 'bar',
  data: {
    labels: ['1', '2', '3'],
    datasets: [{
      data: [[1, 2], [3, 4], [5, 6]]
    }]
  },
});

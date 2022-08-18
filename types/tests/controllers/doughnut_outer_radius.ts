import { Chart } from '../../../src/types';

const chart = new Chart('id', {
  type: 'doughnut',
  data: {
    labels: [],
    datasets: [{
      data: [],
    }]
  },
  options: {
    radius: () => Math.random() > 0.5 ? 50 : '50%',
  }
});

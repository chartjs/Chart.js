import { Chart } from '../../../../src/types.js';

const chart = new Chart('id', {
  type: 'bubble',
  data: {
    labels: [],
    datasets: [{
      data: []
    }]
  },
  options: {
    plugins: {
      colors: {
        enabled: true,
        forceOverride: false,
      }
    }
  }
});

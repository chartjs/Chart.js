import { Chart } from '../../../../src/types.js';

const chart = new Chart('id', {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      data: []
    }]
  },
  options: {
    plugins: {
      tooltip: {
        callbacks: {
          label: (item) => {
            return `Y Axis ${item.dataset.yAxisID}`;
          }
        }
      }
    }
  },
});

import { Chart } from '../../src/types.js';

const chart = new Chart('test', {
  type: 'bar',
  data: {
    labels: ['a'],
    datasets: [{
      data: [1],
    }, {
      type: 'line',
      data: [{ x: 1, y: 1 }]
    }]
  },
  options: {
    animation: {
      duration: 500
    },
    backgroundColor: 'red',
    datasets: {
      line: {
        animation: {
          duration: 600
        },
        backgroundColor: 'blue',
      }
    },
    elements: {
      point: {
        backgroundColor: 'red'
      }
    }
  }
});

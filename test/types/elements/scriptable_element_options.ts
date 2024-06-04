import { Chart } from '../../../src/types.js';

const chart = new Chart('id', {
  type: 'line',
  data: {
    labels: [],
    datasets: []
  },
  options: {
    elements: {
      line: {
        borderWidth: () => 2,
      },
      point: {
        pointStyle: (ctx) => 'star',
      }
    }
  }
});

const chart2 = new Chart('id', {
  type: 'bar',
  data: {
    labels: [],
    datasets: []
  },
  options: {
    elements: {
      bar: {
        borderWidth: (ctx) => 2,
      }
    }
  }
});

const chart3 = new Chart('id', {
  type: 'doughnut',
  data: {
    labels: [],
    datasets: []
  },
  options: {
    elements: {
      arc: {
        borderWidth: (ctx) => 3,
        borderJoinStyle: (ctx) => 'miter'
      }
    }
  }
});

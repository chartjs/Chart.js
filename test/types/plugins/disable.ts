import { Chart } from '../../../src/types.js';

const chart = new Chart('id', {
  type: 'bubble',
  data: {
    labels: [],
    datasets: [{
      data: []
    }]
  },
  options: {
    plugins: false
  }
});

const chart1 = new Chart('id', {
  type: 'bubble',
  data: {
    labels: [],
    datasets: [{
      data: []
    }]
  },
  options: {
    plugins: {
      legend: false
    }
  }
});
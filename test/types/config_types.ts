import { Chart } from '../../src/types.js';

const chart = new Chart('chart', {
  type: 'bar',
  data: {
    labels: ['1', '2', '3'],
    datasets: [{
      data: [1, 2, 3]
    },
    {
      data: [1, 2, 3]
    }],
  }
});

chart.config.type = 'line';

const chart2 = new Chart('chart', {
  type: 'bar',
  data: {
    labels: ['1', '2', '3'],
    datasets: [{
      type: 'line',
      data: [1, 2, 3]
    },
    {
      type: 'line',
      data: [1, 2, 3]
    }],
  }
});

chart2.config.type = 'line';

const chart3 = new Chart('chart', {
  data: {
    labels: ['1', '2', '3'],
    datasets: [{
      type: 'bar',
      data: [1, 2, 3]
    },
    {
      type: 'bar',
      data: [1, 2, 3],
      categoryPercentage: 10
    }],
  }
});

chart3.config.type = 'line';

const chart4 = new Chart('chart', {
  data: {
    labels: ['1', '2', '3'],
    datasets: [{
      type: 'bar',
      data: [1, 2, 3]
    }]
  }
});

chart4.data.datasets.push({
  type: 'line',
  data: [1, 2, 3]
});

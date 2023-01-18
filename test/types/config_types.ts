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

const chart5 = new Chart('chart', {
  data: {
    labels: ['1', '2', '3'],
    datasets: [{
      type: 'line',
      data: [{
        category: '1',
        value: 1
      }]
    }]
  }
});

chart5.data.datasets.push({
  type: 'line',
  data: [{
    category: '1',
    value: 1
  }]
});

chart5.config.data.datasets.push({
  type: 'line',
  data: [{
    category: '2',
    value: 2
  }]
});

const dataset = chart5.data.datasets[0];
// number | Point | [number, number] | BubbleDataPoint | { category: string, value: number }
const datapoint = dataset.data[0];

if (typeof datapoint === 'object' && 'category' in datapoint) {
  // datapoint: { category: string, value: number }
  datapoint.value = 2;
}

if (dataset.type === 'line') {
  // number | Point | { category: string, value: number }
  const lineDatapoint = dataset.data[0];

  if (typeof lineDatapoint === 'object' && 'category' in lineDatapoint) {
    // datapoint: { category: string, value: number }
    lineDatapoint.value = 2;
  }
}

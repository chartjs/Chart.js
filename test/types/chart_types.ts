import { Chart } from '../../src/types.js';

const chart = new Chart('chart', {
  type: 'bar',
  data: {
    labels: ['1', '2', '3'],
    datasets: [{
      data: [1, 2, 3]
    },
    {
      data: [1, 2, 3],
      categoryPercentage: 10
    }],
  }
});

const chart2 = new Chart('chart', {
  type: 'bar',
  data: {
    labels: ['1', '2', '3'],
    datasets: [{
      type: 'line',
      data: [1, 2, 3],
      // @ts-expect-error should not allow bar properties to be defined in a line dataset
      categoryPercentage: 10
    },
    {
      type: 'line',
      pointBackgroundColor: 'red',
      data: [1, 2, 3]
    },
    {
      data: [1, 2, 3],
      categoryPercentage: 10
    }],
  }
});

const chart3 = new Chart('chart', {
  data: {
    labels: ['1', '2', '3'],
    datasets: [{
      type: 'bar',
      data: [1, 2, 3],
      categoryPercentage: 10
    },
    {
      type: 'bar',
      data: [1, 2, 3],
      // @ts-expect-error should not allow line properties to be defined in a bar dataset
      pointBackgroundColor: 'red',
    }],
  }
});

// @ts-expect-error all datasets should have a type property or a default fallback type should be set
const chart4 = new Chart('chart', {
  data: {
    labels: ['1', '2', '3'],
    datasets: [{
      type: 'bar',
      data: [1, 2, 3],
      categoryPercentage: 10
    },
    {
      data: [1, 2, 3]
    }],
  }
});

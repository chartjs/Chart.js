import { Chart } from '../index.esm';

const chart = new Chart('chart', {
  type: 'bar',
  data: {
    labels: ['1', '2', '3'],
    datasets: [{ 
        data: [1,2, 3]
    },
    { 
        data: [1,2, 3]
    }],
  }
});

const chart2 = new Chart('chart', {
  type: 'bar',
  data: {
    labels: ['1', '2', '3'],
    datasets: [{
        type: 'line',
        data: [1,2, 3]
    },
    { 
        data: [1,2, 3]
    }],
  }
});

const chart3 = new Chart('chart', {
  data: {
    labels: ['1', '2', '3'],
    datasets: [{
        type: 'bar',
        data: [1,2, 3]
    },
    { 
        type: 'bar',
        data: [1,2, 3]
    }],
  }
});

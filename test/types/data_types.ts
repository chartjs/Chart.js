import { Chart } from '../../src/types.js';

const chart = new Chart('chart', {
  type: 'bar',
  data: {
    labels: ['1', '2', '3'],
    datasets: [{ data: [[1, 2], [1, 2], [1, 2]] }],
  }
});

const chart2 = new Chart('chart2', {
  type: 'bar',
  data: {
    datasets: [{
      data: [{ id: 'Sales', nested: { value: 1500 } }, { id: 'Purchases', nested: { value: 500 } }],
    }],
  },
  options: { parsing: { xAxisKey: 'id', yAxisKey: 'nested.value' },
  },
});

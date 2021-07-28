import { Chart } from '../../../index.esm';

const chart = new Chart('id', {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      data: []
    }]
  },
});

const tooltip = chart.tooltip;

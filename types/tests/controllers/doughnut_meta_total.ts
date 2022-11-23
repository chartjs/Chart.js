import { Chart, ChartMeta, Element } from '../../../src/types.js';

const chart = new Chart('id', {
  type: 'doughnut',
  data: {
    labels: [],
    datasets: [{
      data: [],
    }]
  },
});

// A cast is required because the exact type of ChartMeta will vary with
// mixed charts
const meta = <ChartMeta<'doughnut', Element, Element>>chart.getDatasetMeta(0);
const total = meta.total;

import { Chart, ChartMeta, Element } from '../../index.esm';

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
const meta = <ChartMeta<Element, Element, 'doughnut'>>chart.getDatasetMeta(0);
const total = meta.total;

import { Chart, ChartMeta, Element } from '../../index.esm';

const chart = new Chart('id', {
  type: 'doughnut',
  data: {
    labels: [],
    datasets: [{
      data: [],
      offset: 40,
    }]
  },
  options: {
    offset: 20,
  }
});

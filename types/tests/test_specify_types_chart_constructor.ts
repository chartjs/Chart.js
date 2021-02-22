import { Chart, CartesianParsedData } from '../index.esm';

const chart = new Chart('id', {
  type: 'scatter',
  data: {
    labels: [],
    datasets: []
  },
  options: {},
});

interface Context {
  chart: Chart;
}

const ctx: Context = {
  chart: chart
};

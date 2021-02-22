import { Chart } from '../index.esm';

const chart = new Chart<'scatter', number[], string>('id', {
  type: 'scatter',
  data: {
    labels: [],
    datasets: []
  },
  options: {},
});

interface Context {
  chart: Chart<'scatter'|'bar', unknown[], unknown, unknown>;
}

const ctx: Context = {
  chart: chart
};
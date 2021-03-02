import { Chart } from '../index.esm';

const chart = new Chart('id', {
  type: 'scatter',
  data: {
    labels: [],
    datasets: [{
      data: [{ x: 1, y: 1 }],
      pointRadius: (ctx) => ctx.parsed.x,
    }]
  },
});

interface Context {
  chart: Chart;
}

export const ctx: Context = {
  chart: chart
};

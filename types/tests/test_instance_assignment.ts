import { Chart } from '../index.esm';

const chart = new Chart('id', {
  type: 'scatter',
  data: {
    labels: [],
    datasets: [{
      data: [{ x: 0, y: 1 }],
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

// @ts-expect-error Type '{ x: number; y: number; }[]' is not assignable to type 'number[]'.
export const dataArray: number[] = chart.data.datasets[0].data;

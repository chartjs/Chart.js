import { Chart } from '../../index.esm';

const chart = new Chart('id', {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      data: [],
      segment: {
        borderColor: ctx => ctx.p0.skip ? 'gray' : undefined,
        borderWidth: ctx => ctx.p1.parsed.y > 10 ? 5 : undefined,
      }
    }]
  },
});

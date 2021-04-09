import { Chart } from '../../index.esm';

const chart = new Chart('id', {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      data: [],
      segment: {
        backgroundColor: ctx => ctx.p0.skip ? 'transparent' : undefined,
        borderColor: ctx => ctx.p0.skip ? 'gray' : undefined,
        borderWidth: ctx => ctx.p1.parsed.y > 10 ? 5 : undefined,
      }
    }]
  },
});

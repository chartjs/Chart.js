import { Chart } from '../../index.esm';

const chart = new Chart('id', {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      data: [],
      segments: {
        borderColor: ctx => ctx.p1.skip ? 'gray' : undefined,
        borderWidth: ctx => ctx.p2.parsed.y > 10 ? 5 : undefined,
      }
    }]
  },
});

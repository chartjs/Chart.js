import { Chart } from '../../index.esm';

const chart = new Chart('test', {
  type: 'bar',
  data: {
    labels: ['a'],
    datasets: [{
      data: [1],
    }, {
      type: 'line',
      data: [{ x: 1, y: 1 }]
    }]
  },
  options: {
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'year'
        }
      },
      x1: {
        // @ts-expect-error Type '"linear"' is not assignable to type '"timeseries" | undefined'.
        type: 'linear',
        time: {
          // @ts-expect-error Type 'string' is not assignable to type 'false | "millisecond" | "second" | "minute" | "hour" | "day" | "week" | "month" | "quarter" | "year" | undefined'.
          unit: 'year'
        }
      }
    }
  }
});

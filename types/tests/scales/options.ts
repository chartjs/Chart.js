import { Chart, ScaleOptions } from '../../../src/types.js';

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
        },
        ticks: {
          stepSize: 1
        }
      },
      x1: {
        type: 'linear',
        // @ts-expect-error 'time' does not exist in 'linear' options
        time: {
          unit: 'year'
        }
      },
      y: {
        ticks: {
          callback(tickValue) {
            const value = this.getLabelForValue(tickValue as number);
            return '$' + value;
          }
        }
      }
    }
  }
});

function makeChartScale(range: number): ScaleOptions<'linear'> {
  return {
    type: 'linear',
    min: 0,
    suggestedMax: range,
  };
}

const composedChart = new Chart('test2', {
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
      x: makeChartScale(10)
    }
  }
});

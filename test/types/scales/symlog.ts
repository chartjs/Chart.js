import { Chart, ScaleOptions, SymLogScale, Ticks } from '../../../src/types.js';

Chart.register(SymLogScale);

const chart = new Chart('test', {
  type: 'line',
  data: {
    datasets: [{
      data: [{ x: -5, y: 0 }, { x: 0, y: 35 }, { x: 4200, y: 1e8 }]
    }]
  },
  options: {
    scales: {
      x: {
        type: 'symlog',
        linearThreshold: 1
      },
      y: {
        type: 'symlog',
        linearThreshold: 100,
        min: -1000,
        suggestedMax: 1e8,
        grace: '5%',
        beginAtZero: true,
        reverse: false,
        ticks: {
          format: { maximumFractionDigits: 1 },
          callback(tickValue, index, ticks) {
            return Ticks.formatters.symlog.call(this, tickValue as number, index, ticks) + ' copies/mL';
          }
        }
      },
      y1: {
        type: 'symlog',
        // @ts-expect-error linearThreshold must be a number
        linearThreshold: '100'
      },
      y2: {
        type: 'linear',
        // @ts-expect-error linearThreshold only exists on symlog scales
        linearThreshold: 100
      },
      y3: {
        type: 'symlog',
        // @ts-expect-error 'time' does not exist in 'symlog' options
        time: {
          unit: 'year'
        }
      }
    }
  }
});

const scaleOptions: ScaleOptions<'symlog'> = {
  type: 'symlog',
  linearThreshold: 10,
  grace: 1000
};

Ticks.formatters.symlog.call(chart.scales.y, 1e6, 0, [{ value: 1e6 }]);

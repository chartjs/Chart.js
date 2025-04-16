import { Chart, Ticks } from '../../../src/types.js';

// @ts-expect-error The 'this' context... is not assignable to method's 'this' of type 'Scale<CoreScaleOptions>'.
Ticks.formatters.numeric(0, 0, [{ value: 0 }]);

const chart = new Chart('test', {
  type: 'line',
  data: {
    datasets: [{
      data: [{ x: 1, y: 1 }]
    }]
  },
});

Ticks.formatters.numeric.call(chart.scales.x, 0, 0, [{ value: 0 }]);

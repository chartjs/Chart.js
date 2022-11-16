import { Chart } from '../../src/types.js';

Chart.defaults.scales.time.time.minUnit = 'day';

Chart.defaults.plugins.title.display = false;

Chart.defaults.datasets.bar.backgroundColor = 'red';

Chart.defaults.animation = { duration: 500 };

Chart.defaults.font.size = 8;

// @ts-expect-error should be number
Chart.defaults.font.size = '8';

// @ts-expect-error should be number
Chart.defaults.font.size = () => '10';

Chart.defaults.font = {
  family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
  size: 10
};

Chart.defaults.layout = {
  padding: {
    bottom: 10,
  },
};

Chart.defaults.plugins.tooltip.boxPadding = 3;

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

Chart.defaults.backgroundColor = 'red';
Chart.defaults.backgroundColor = ['red', 'blue'];
Chart.defaults.backgroundColor = (ctx) => ctx.datasetIndex % 2 === 0 ? 'red' : 'blue';

Chart.defaults.borderColor = 'red';
Chart.defaults.borderColor = ['red', 'blue'];
Chart.defaults.borderColor = (ctx) => ctx.datasetIndex % 2 === 0 ? 'red' : 'blue';

Chart.defaults.hoverBackgroundColor = 'red';
Chart.defaults.hoverBackgroundColor = ['red', 'blue'];
Chart.defaults.hoverBackgroundColor = (ctx) => ctx.datasetIndex % 2 === 0 ? 'red' : 'blue';

Chart.defaults.hoverBorderColor = 'red';
Chart.defaults.hoverBorderColor = ['red', 'blue'];
Chart.defaults.hoverBorderColor = (ctx) => ctx.datasetIndex % 2 === 0 ? 'red' : 'blue';

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

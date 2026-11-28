import { Chart } from '../../../../src/types.js';

// A custom legend onClick of a pie chart can call the pie chart's default
// handler with its own event, item and legend.
const defaultOnClick = Chart.overrides.pie.plugins.legend.onClick;

export const chart = new Chart('id', {
  type: 'pie',
  data: {
    labels: [],
    datasets: []
  },
  options: {
    plugins: {
      legend: {
        onClick(e, legendItem, legend) {
          defaultOnClick.call(legend, e, legendItem, legend);
        }
      }
    }
  }
});

Chart.overrides.pie.plugins.legend.onClick = function(e, legendItem, legend) {
  defaultOnClick.call(this, e, legendItem, legend);
};

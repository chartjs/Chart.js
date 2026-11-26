import {Chart, ChartEvent, ChartType, LegendElement, LegendItem} from 'chart.js';

// A legend callback typed for any chart type must not decide the type of the
// chart: the line chart keeps the `title` of its cartesian scales.
const chart = new Chart('id', {
  type: 'line',
  data: {datasets: []},
  options: {
    plugins: {
      legend: {
        onClick(e: ChartEvent, legendItem: LegendItem, legend: LegendElement<ChartType>) {
          legend.chart.update();
        }
      }
    }
  }
});

export const titleColor = chart.options.scales?.x?.title?.color;

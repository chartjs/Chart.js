import { Chart, ChartEvent, ChartType, LegendElement, LegendItem } from '../../../../src/types.js';

// A legend callback whose `legend` parameter is typed for any chart type must
// not decide the type of the chart: the chart stays a line chart, so its
// cartesian scales keep their `title`.
const chart = new Chart('id', {
  type: 'line',
  data: {
    labels: [],
    datasets: []
  },
  options: {
    plugins: {
      legend: {
        onClick(e: ChartEvent, legendItem: LegendItem, legend: LegendElement<ChartType>) {
          legend.chart.update();
        },
        onHover(e: ChartEvent, legendItem: LegendItem, legend: LegendElement<ChartType>) {
          legend.chart.update();
        },
        onLeave(e: ChartEvent, legendItem: LegendItem, legend: LegendElement<ChartType>) {
          legend.chart.update();
        }
      }
    }
  }
});

const title = chart.options.scales?.x?.title;
if (title?.color !== undefined) {
  title.color = 'red';
}

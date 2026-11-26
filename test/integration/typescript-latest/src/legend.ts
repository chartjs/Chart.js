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

// The same for a callback that types only `this`, one chart per callback.
const clickChart = new Chart('id', {
  type: 'line',
  data: {datasets: []},
  options: {plugins: {legend: {onClick(this: LegendElement<ChartType>, e: ChartEvent, legendItem: LegendItem) {
    this.chart.update();
  }}}}
});
const hoverChart = new Chart('id', {
  type: 'line',
  data: {datasets: []},
  options: {plugins: {legend: {onHover(this: LegendElement<ChartType>, e: ChartEvent, legendItem: LegendItem) {
    this.chart.update();
  }}}}
});
const leaveChart = new Chart('id', {
  type: 'line',
  data: {datasets: []},
  options: {plugins: {legend: {onLeave(this: LegendElement<ChartType>, e: ChartEvent, legendItem: LegendItem) {
    this.chart.update();
  }}}}
});

export const titles = [
  clickChart.options.scales?.x?.title,
  hoverChart.options.scales?.x?.title,
  leaveChart.options.scales?.x?.title
];

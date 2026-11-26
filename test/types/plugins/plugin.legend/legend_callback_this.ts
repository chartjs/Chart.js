import { Chart, ChartEvent, ChartType, LegendElement, LegendItem } from '../../../../src/types.js';

// A legend callback that types only `this` for any chart type must not decide
// the type of the chart either. One chart per callback, so that each callback's
// `this` is checked on its own.
const clickChart = new Chart('id', {
  type: 'line',
  data: {
    labels: [],
    datasets: []
  },
  options: {
    plugins: {
      legend: {
        onClick(this: LegendElement<ChartType>, e: ChartEvent, legendItem: LegendItem) {
          this.chart.update();
        }
      }
    }
  }
});

const hoverChart = new Chart('id', {
  type: 'line',
  data: {
    labels: [],
    datasets: []
  },
  options: {
    plugins: {
      legend: {
        onHover(this: LegendElement<ChartType>, e: ChartEvent, legendItem: LegendItem) {
          this.chart.update();
        }
      }
    }
  }
});

const leaveChart = new Chart('id', {
  type: 'line',
  data: {
    labels: [],
    datasets: []
  },
  options: {
    plugins: {
      legend: {
        onLeave(this: LegendElement<ChartType>, e: ChartEvent, legendItem: LegendItem) {
          this.chart.update();
        }
      }
    }
  }
});

export const titles = [
  clickChart.options.scales?.x?.title,
  hoverChart.options.scales?.x?.title,
  leaveChart.options.scales?.x?.title
];

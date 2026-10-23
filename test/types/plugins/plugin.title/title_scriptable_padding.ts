import { Chart, ScriptableChartContext } from '../../../../src/types.js';

const chart = new Chart('id', {
  type: 'line',
  data: {
    labels: [],
    datasets: []
  },
  options: {
    plugins: {
      title: {
        padding: (ctx) => {
          const context: ScriptableChartContext = ctx;
          return context.chart.width > 400 ? 20 : 10;
        }
      },
      subtitle: {
        padding: (ctx) => ({
          top: ctx.chart.width > 400 ? 20 : 10,
          bottom: 5
        })
      }
    }
  }
});

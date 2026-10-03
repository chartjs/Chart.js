import { Chart, GridLineOptions, ScriptableScaleContext } from '../../../src/types.js';

const grid: Partial<GridLineOptions> = {
  tickWidth: (context: ScriptableScaleContext) => context.tick.value === 0 ? 2 : 1
};

const chart = new Chart('test', {
  type: 'line',
  data: { datasets: [] },
  options: {
    scales: {
      x: { grid },
      y: {
        grid: {
          tickWidth: (context) => {
            const scaleContext: ScriptableScaleContext = context;
            return scaleContext.tick.value === 0 ? 2 : 1;
          }
        }
      },
      y1: { grid: { tickWidth: [1, 2] } },
      y2: { grid: { tickWidth: 2 } }
    }
  }
});

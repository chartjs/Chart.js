import { Chart } from '../../../index.esm';

Chart.overrides.bubble.plugins.tooltip.callbacks.label = (item) => {
  const { x, y, _custom: r } = item.parsed;
  return `${item.label}: (${x}, ${y}, ${r})`;
};

const chart = new Chart('id', {
  type: 'bubble',
  data: {
    labels: [],
    datasets: [{
      data: []
    }]
  },
});

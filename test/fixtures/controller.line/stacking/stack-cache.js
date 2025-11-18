function makeDs(label, offset) {
  return {
    label,
    data: [
      [0, 12],
      [1, 19],
      [2, 3],
      [2, 5],
      [3, 2],
      [4, 3],
    ].map(([x, y]) => ({x, y: y === null ? null : y + offset})),
    showLine: true,
    spanGaps: false,
    stack: `stack${label}`,
    borderColor: label === 'A' ? '#c00' : '#00c'
  };
}

const dsA = makeDs('A', 0);
const dsB = makeDs('B', 1);

module.exports = {
  config: {
    type: 'scatter',
    data: {
      datasets: [dsA, dsB],
    },
    options: {
      scales: {
        x: {display: false},
        y: {display: false},
      },
      elements: {
        point: {
          backgroundColor: '#444',
        },
      },
      layout: {
        padding: {
          left: 24,
          right: 24,
        },
      },
    },
  },
  options: {
    canvas: {
      height: 128,
      width: 256,
    },
    async run(chart) {
      chart.data = {datasets: [dsB, dsA]};
      chart.update();
    }
  },
};

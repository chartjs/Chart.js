module.exports = {
  config: {
    type: 'bubble',
    data: {
      datasets: [{
        data: [
          {x: 1, y: 1, r: 80},
          {x: 1, y: 1, r: 20}
        ],
        drawActiveElementsOnTop: false,
        backgroundColor: (ctx) => (ctx.dataIndex === 1 ? 'red' : 'blue'),
        hoverBackgroundColor: 'yellow',
        hoverRadius: 0,
      }]
    },
    options: {
      scales: {
        x: {
          display: false
        },
        y: {
          display: false
        },
      },
      plugins: {
        tooltip: false,
        legend: false
      },
    }
  },
  options: {
    canvas: {
      width: 256,
      height: 256
    },
    async run(chart) {
      const point = chart.getDatasetMeta(0).data[0];
      await jasmine.triggerMouseEvent(chart, 'click', {y: point.y, x: point.x + 25});
    }
  }
};

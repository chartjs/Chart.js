module.exports = {
  config: {
    type: 'scatter',
    data: {
      datasets: [{
        data: [{x: 1, y: 1}, {x: 48, y: 1}]
      }]
    },
    options: {
      events: ['click'],
      interaction: {
        mode: 'nearest',
        intersect: false
      },
      plugins: {
        tooltip: true,
        legend: false
      },
      scales: {
        x: {
          min: 5,
          max: 50
        },
        y: {
          min: 0,
          max: 2
        }
      },
      layout: {
        padding: 50
      }
    }
  },
  options: {
    spriteText: true,
    canvas: {
      width: 256,
      height: 256
    },
    async run(chart) {
      const point = chart.getDatasetMeta(0).data[0];
      await jasmine.triggerMouseEvent(chart, 'click', {y: point.y, x: chart.chartArea.left});
    }
  }
};

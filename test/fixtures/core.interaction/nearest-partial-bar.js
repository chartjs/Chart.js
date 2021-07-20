module.exports = {
  config: {
    type: 'bar',
    data: {
      labels: ['a', 'b', 'c'],
      datasets: [
        {
          data: [220, 250, 225],
        },
      ],
    },
    options: {
      events: ['click'],
      interaction: {
        mode: 'nearest'
      },
      plugins: {
        tooltip: true,
        legend: false
      },
      scales: {
        y: {
          beginAtZero: false
        }
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
      const point = {
        x: chart.chartArea.left + chart.chartArea.width / 2,
        y: chart.chartArea.top + chart.chartArea.height / 2,
      };
      await jasmine.triggerMouseEvent(chart, 'click', point);
    }
  }
};

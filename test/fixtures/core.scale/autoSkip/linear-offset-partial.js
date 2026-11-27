module.exports = {
  description: 'https://github.com/chartjs/Chart.js/issues/9614',
  config: {
    type: 'scatter',
    data: {
      datasets: [{
        data: [{x: 0, y: 0}, {x: 500, y: 1}]
      }]
    },
    options: {
      plugins: {legend: false},
      scales: {
        x: {
          min: 0,
          max: 1000,
          offset: true,
          ticks: {stepSize: 10, maxRotation: 0},
          afterBuildTicks: function(scale) {
            scale.ticks = scale.ticks.filter((tick) => tick.value <= 500);
          }
        },
        y: {display: false}
      }
    }
  },
  options: {
    spriteText: true,
    canvas: {
      width: 620,
      height: 100
    }
  }
};

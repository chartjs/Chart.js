module.exports = {
  description: 'ticks.autoSkipKeepEnds on a linear axis with offset',
  config: {
    type: 'scatter',
    data: {
      datasets: [{
        data: [{x: 0, y: 0}, {x: 97, y: 1}]
      }]
    },
    options: {
      plugins: {legend: false},
      scales: {
        x: {
          min: 0,
          max: 97,
          offset: true,
          ticks: {stepSize: 1, maxRotation: 0, autoSkipKeepEnds: true}
        },
        y: {display: false}
      }
    }
  },
  options: {
    spriteText: true,
    canvas: {
      width: 300,
      height: 100
    }
  }
};

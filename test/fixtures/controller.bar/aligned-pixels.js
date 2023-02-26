module.exports = {
  config: {
    type: 'bar',
    data: {
      labels: ['a'],
      datasets: [{
        data: [-1]
      }, {
        data: [1]
      }]
    },
    options: {
      indexAxis: 'y',
      events: [],
      backgroundColor: 'navy',
      devicePixelRatio: 1.25,
      scales: {
        x: {display: false, alignToPixels: true},
        y: {display: false, stacked: true}
      }
    }
  },
  options: {
    canvas: {
      width: 100,
      height: 500
    }
  }
};

module.exports = {
  description: 'showLine option should not draw a line if undefined',
  config: {
    type: 'scatter',
    data: {
      datasets: [{
        data: [{x: 10, y: 15}, {x: 15, y: 10}],
        pointRadius: 10,
        backgroundColor: 'red',
        label: 'dataset1'
      }],
    },
    options: {
      scales: {
        x: {
          display: false
        },
        y: {
          display: false
        }
      }
    }
  },
  options: {
    canvas: {
      width: 256,
      height: 256
    }
  }
};

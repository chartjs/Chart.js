module.exports = {
  config: {
    type: 'bubble',
    data: {
      labels: [2, 2, 2, 2],
      datasets: [{
        data: [
          [1, 1],
          [1, 2],
          [1, 3, 20],
          [1, 4, 20]
        ]
      }, {
        data: [1, 2, 3, 4]
      }, {
        data: [{x: 3, y: 1}, {x: 3, y: 2}, {x: 3, y: 3, r: 15}, {x: 3, y: 4, r: 15}]
      }]
    },
    options: {
      events: [],
      radius: 10,
      hoverRadius: 0,
      backgroundColor: 'blue',
      hoverBackgroundColor: 'red',
      scales: {
        x: {display: false, bounds: 'data'},
        y: {display: false}
      },
      layout: {
        padding: 24
      }
    }
  },
  options: {
    canvas: {
      height: 256,
      width: 256
    },
    run(chart) {
      chart.setActiveElements([
        {datasetIndex: 0, index: 1}, {datasetIndex: 0, index: 2},
        {datasetIndex: 1, index: 1}, {datasetIndex: 1, index: 2},
        {datasetIndex: 2, index: 1}, {datasetIndex: 2, index: 2},
      ]);
      chart.update();
    }
  }
};

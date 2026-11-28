module.exports = {
  config: {
    type: 'polarArea',
    data: {
      labels: [0, 1, 2, 3, 4, 5],
      datasets: [
        {
          // option in dataset
          data: [5, 2, 4, 7, 6, 8],
          borderAlign: 'inner',
          borderColor: 'black'
        },
      ]
    },
    options: {
      events: [],
      elements: {
        arc: {
          backgroundColor: 'transparent',
          borderWidth: 1,
          hoverBorderDash: [3, 3]
        }
      },
      scales: {
        r: {
          display: false
        }
      }
    }
  },
  options: {
    canvas: {
      height: 256,
      width: 512
    },
    run(chart) {
      chart.setActiveElements([
        {datasetIndex: 0, index: 0}, {datasetIndex: 0, index: 3}
      ]);
      chart.update();
    }
  }
};

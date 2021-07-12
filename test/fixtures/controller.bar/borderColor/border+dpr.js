module.exports = {
  threshold: 0,
  tolerance: 0,
  config: {
    type: 'bar',
    data: {
      labels: [0, 1, 2, 3, 4, 5, 6],
      datasets: [
        {
          // option in dataset
          data: [5, 4, 3, 2, 3, 4, 5],
        },
      ]
    },
    options: {
      events: [],
      devicePixelRatio: 1.5,
      barPercentage: 1,
      categoryPercentage: 1,
      backgroundColor: 'black',
      borderColor: 'black',
      borderWidth: 8,
      scales: {
        x: {display: false},
        y: {display: false}
      }
    }
  },
  options: {
    canvas: {
      height: 256,
      width: 501
    }
  }
};

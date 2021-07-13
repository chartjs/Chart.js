module.exports = {
  threshold: 0.01,
  config: {
    type: 'bar',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          data: [9, 25, 13, 17, 12, 21, 20, 19, 6, 12, 14, 20],
          categoryPercentage: 1,
          barPercentage: 1,
          backgroundColor: '#2E5C76',
          borderWidth: 2,
          borderColor: '#377395',
          borderRadius: 5,
        },
      ]
    },
    options: {
      devicePixelRatio: 1.25,
      scales: {
        x: {display: false},
        y: {display: false}
      }
    }
  },
  options: {
    canvas: {
      height: 256,
      width: 512
    }
  }
};

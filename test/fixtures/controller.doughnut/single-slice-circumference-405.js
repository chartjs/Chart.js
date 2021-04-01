module.exports = {
  threshold: 0.01,
  config: {
    type: 'doughnut',
    data: {
      labels: ['A'],
      datasets: [{
        data: [1],
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderColor: 'rgba(0,0,0,0.5)',
        circumference: 405
      }]
    },
  },
  options: {
    canvas: {
      width: 256,
      height: 256
    }
  }
};

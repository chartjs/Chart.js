module.exports = {
  config: {
    type: 'doughnut',
    data: {
      labels: ['A'],
      datasets: [{
        data: [385],
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderColor: 'rgba(0,0,0,0.5)',
      }]
    },
    options: {
      offset: 20
    }
  }
};

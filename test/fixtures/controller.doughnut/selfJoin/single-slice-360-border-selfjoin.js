module.exports = {
  tolerance: 0.015,
  config: {
    type: 'doughnut',
    data: {
      labels: ['A'],
      datasets: [{
        data: [360],
        backgroundColor: '#dda7ee',
        borderColor: '#6e0d8f',
        borderWidth: 1,
        selfJoin: true,
      }]
    },
    options: {
      spacing: 10,
    }
  }
};

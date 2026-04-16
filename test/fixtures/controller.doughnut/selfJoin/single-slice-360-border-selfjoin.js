module.exports = {
  config: {
    type: 'doughnut',
    data: {
      labels: ['A'],
      datasets: [{
        data: [360],
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderColor: 'rgba(0,0,0,1)',
        borderWidth: 1,
        selfJoin: true,
      }]
    },
    options: {
      spacing: 10,
    }
  }
};

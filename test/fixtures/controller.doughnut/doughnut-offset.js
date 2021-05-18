module.exports = {
  config: {
    type: 'doughnut',
    data: {
      labels: ['Red', 'Blue', 'Yellow'],
      datasets: [{
        data: [12, 4, 6],
        backgroundColor: ['red', 'blue', 'yellow']
      }]
    },
    options: {
      offset: 40,
      layout: {
        padding: 50
      }
    }
  }
};

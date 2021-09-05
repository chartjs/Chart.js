module.exports = {
  config: {
    type: 'doughnut',
    data: {
      labels: ['Red', 'Blue', 'Yellow'],
      datasets: [{
        data: [
          {foo: 12},
          {foo: 4},
          {foo: 6},
        ],
        backgroundColor: ['red', 'blue', 'yellow']
      }]
    },
    options: {
      parsing: {
        key: 'foo'
      }
    }
  }
};

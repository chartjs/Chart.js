module.exports = {
  config: {
    type: 'doughnut',
    data: {
      labels: ['Red'],
      datasets: [
        {
          // option in dataset
          data: [100],
          borderWidth: 15,
          backgroundColor: '#FF0000',
          borderColor: '#000000',
          borderAlign: 'center',
          selfJoin: true
        }
      ]
    }
  },
  options: {
    canvas: {
      height: 256,
      width: 512
    }
  }
};

module.exports = {
  config: {
    type: 'pie',
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
          borderJoinStyle: 'round',
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

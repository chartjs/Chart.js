module.exports = {
  config: {
    type: 'bar',
    data: {
      datasets: [{
        data: [1, 2, 3],
      }],
      labels: [['Label1', 'line 2', 'line3'], 'Label2', 'Label3']
    },
    options: {
      scales: {
        x: {
          position: 'top',
          ticks: {
            crossAlign: 'center',
          },
        },
      }
    }
  },
  options: {
    spriteText: true,
    canvas: {
      height: 256,
      width: 512
    }
  }
};

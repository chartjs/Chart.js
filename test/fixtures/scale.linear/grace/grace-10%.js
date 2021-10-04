module.exports = {
  config: {
    type: 'bar',
    data: {
      labels: ['a', 'b'],
      datasets: [{
        data: [90, -10],
      }],
    },
    options: {
      indexAxis: 'y',
      scales: {
        y: {
          display: false
        },
        x: {
          grace: '10%'
        }
      }
    }
  },
  options: {
    spriteText: true,
    canvas: {
      width: 512,
      height: 128
    }
  }
};

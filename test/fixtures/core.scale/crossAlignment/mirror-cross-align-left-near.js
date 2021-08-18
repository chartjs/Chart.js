module.exports = {
  config: {
    type: 'bar',
    data: {
      datasets: [{
        data: [1, 2, 3],
      }],
      labels: ['Long long label 1', 'Label2', 'Label3']
    },
    options: {
      indexAxis: 'y',
      scales: {
        y: {
          position: 'left',
          ticks: {
            mirror: true,
            crossAlign: 'near',
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

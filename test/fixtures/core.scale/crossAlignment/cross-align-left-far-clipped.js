module.exports = {
  config: {
    type: 'bar',
    data: {
      datasets: [{
        data: [1, 2, 3],
      }],
      labels: ['Long long long long label 1', 'Label 2', 'Less more longer label 3']
    },
    options: {
      indexAxis: 'y',
      scales: {
        y: {
          position: 'left',
          ticks: {
            crossAlign: 'far',
          },
          afterFit: axis => {
            axis.width = 64;
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

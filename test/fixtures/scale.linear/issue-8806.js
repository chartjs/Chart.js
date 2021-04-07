module.exports = {
  description: 'https://github.com/chartjs/Chart.js/issues/8806',
  config: {
    type: 'bar',
    data: {
      labels: ['0', '1', '2', '3', '4', '5', '6'],
      datasets: [{
        label: '# of Votes',
        data: [32, 46, 28, 21, 20, 13, 27]
      }]
    },
    options: {
      scales: {
        x: {display: false},
        y: {ticks: {maxTicksLimit: 4}, min: 0}
      }
    }
  },
  options: {
    spriteText: true,
    canvas: {
      width: 256,
      height: 256
    }
  }
};

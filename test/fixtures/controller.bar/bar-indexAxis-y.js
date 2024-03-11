module.exports = {
  config: {
    type: 'bar',
    data: {
      datasets: [{
        label: '# of Votes',
        data: {a: 1, b: 3, c: 2}
      }]
    },
    options: {
      indexAxis: 'y'
    }
  },
  options: {
    canvas: {
      height: 256,
      width: 512
    }
  }
};

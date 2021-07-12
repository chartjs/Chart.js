module.exports = {
  threshold: 0.01,
  config: {
    type: 'bar',
    data: {
      datasets: [{
        data: [10, 5, 0, 25, 78],
        backgroundColor: 'transparent'
      }],
      labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick5']
    },
    options: {
      indexAxis: 'y',
      scales: {
        x: {display: false},
        y: {display: true}
      }
    }
  },
  options: {
    spriteText: true,
    canvas: {
      width: 128,
      height: 256
    }
  }
};

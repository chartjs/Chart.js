module.exports = {
  description: 'https://github.com/chartjs/Chart.js/issues/9424',
  config: {
    type: 'line',
    data: {
      labels: [0, 1, 2],
      datasets: [
        {
          data: [1, 1, 1],
          stack: 's1',
          borderColor: '#ff0000',
        },
        {
          data: [2, 2, 2],
          stack: 's1',
          borderColor: '#00ff00',
        },
        {
          data: [3, 3, 3],
          stack: 's1',
          borderColor: '#0000ff',
        }
      ]
    },
    options: {
      borderWidth: 5,
      scales: {
        x: {display: false},
        y: {display: true, stacked: true}
      }
    }
  },
  options: {
    spriteText: true,
    run(chart) {
      chart.data.datasets.splice(1, 0, {data: [1.5, 1.5, 1.5], stack: 's2', borderColor: '#000000'});
      chart.update();
    }
  }
};

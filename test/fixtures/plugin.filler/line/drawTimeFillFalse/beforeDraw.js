module.exports = {
  config: {
    type: 'line',
    data: {
      labels: ['0', '1', '2', '3', '4', '5'],
      datasets: [{
        backgroundColor: 'red',
        data: [3, -3, 0, 5, -5, 0],
        fill: false
      }]
    },
    options: {
      plugins: {
        legend: false,
        title: false,
        filler: {
          drawTime: 'beforeDraw'
        }
      },
    }
  },
};

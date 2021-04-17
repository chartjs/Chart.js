const data = [
  {y: 1, x: 12},
  {y: 3, x: 14},
  {y: 4, x: 20},
  {y: 6, x: 13},
  {y: 9, x: 18},
];

module.exports = {
  config: {
    type: 'line',
    data: {
      datasets: [{
        data: data,
        borderColor: 'red',
        fill: false,
      }, {
        data: data.map((v) => ({y: v.y, x: 2 * v.x - 1.5 * v.y})),
        fill: '-1',
        borderColor: 'blue',
        backgroundColor: 'rgba(255, 200, 0, 0.5)',
      }]
    },
    options: {
      indexAxis: 'y',
      radius: 0,
      plugins: {
        legend: false
      },
      scales: {
        x: {
          display: false,
          type: 'linear'
        },
        y: {
          display: false,
          type: 'linear'
        }
      }
    }
  }
};

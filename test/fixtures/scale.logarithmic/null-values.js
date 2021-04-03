module.exports = {
  config: {
    type: 'line',
    data: {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      datasets: [{
        backgroundColor: 'red',
        borderColor: 'red',
        fill: false,
        data: [
          150,
          null,
          1500,
          200,
          9000,
          3000,
          8888
        ],
        spanGaps: true
      }, {
        backgroundColor: 'blue',
        borderColor: 'blue',
        fill: false,
        data: [
          1000,
          5500,
          800,
          7777,
          null,
          6666,
          5555
        ],
        spanGaps: false
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: {
          display: false,
        },
        y: {
          display: false,
          type: 'logarithmic',
        }
      }
    }
  }
};

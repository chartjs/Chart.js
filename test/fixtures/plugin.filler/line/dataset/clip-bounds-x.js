const labels = [1, 2, 3, 4, 5, 6, 7];
const values = [65, 59, 80, 81, 56, 55, 40];

module.exports = {
  description: 'https://github.com/chartjs/Chart.js/issues/12052',
  config: {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          data: values.map(v => v - 10),
          fill: '1',
          borderColor: 'rgb(255, 0, 0)',
          backgroundColor: 'rgba(255, 0, 0, 0.25)',
          xAxisID: 'x1',
        },
        {
          data: values,
          fill: false,
          borderColor: 'rgb(255, 0, 0)',
          xAxisID: 'x1',
        },
        {
          data: values,
          fill: false,
          borderColor: 'rgb(0, 0, 255)',
          xAxisID: 'x2',
        },
        {
          data: values.map(v => v + 10),
          fill: '-1',
          borderColor: 'rgb(0, 0, 255)',
          backgroundColor: 'rgba(0, 0, 255, 0.25)',
          xAxisID: 'x2',
        }
      ]
    },
    options: {
      indexAxis: 'y',
      animation: false,
      responsive: false,
      plugins: {
        legend: false,
        title: false,
        tooltip: false
      },
      elements: {
        point: {
          radius: 0
        },
        line: {
          cubicInterpolationMode: 'monotone',
          borderColor: 'transparent',
          tension: 0
        }
      },
      scales: {
        x2: {
          axis: 'x',
          stack: 'stack',
          max: 80,
          display: false,
        },
        x1: {
          min: 50,
          axis: 'x',
          stack: 'stack',
          display: false,
        },
        y: {
          display: false,
        }
      }
    }
  },
};

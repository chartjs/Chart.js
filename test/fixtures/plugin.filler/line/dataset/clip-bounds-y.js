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
          yAxisID: 'y1',
        },
        {
          data: values,
          fill: false,
          borderColor: 'rgb(255, 0, 0)',
          yAxisID: 'y1',
        },
        {
          data: values,
          fill: false,
          borderColor: 'rgb(0, 0, 255)',
          yAxisID: 'y2',
        },
        {
          data: values.map(v => v + 10),
          fill: '-1',
          borderColor: 'rgb(0, 0, 255)',
          backgroundColor: 'rgba(0, 0, 255, 0.25)',
          yAxisID: 'y2',
        }
      ]
    },
    options: {
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
        y2: {
          axis: 'y',
          stack: 'stack',
          max: 80,
          display: false,
        },
        y1: {
          min: 50,
          axis: 'y',
          stack: 'stack',
          display: false,
        },
        x: {
          display: false,
        }
      }
    }
  },
};

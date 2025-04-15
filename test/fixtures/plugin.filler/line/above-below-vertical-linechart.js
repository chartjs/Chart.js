module.exports = {
  config: {
    type: 'line',
    data: {
      labels: [1, 2, 3, 4],
      datasets: [
        {
          data: [200, 400, 200, 400],
          cubicInterpolationMode: 'monotone',
          tension: 0.4,
          spanGaps: true,
          borderColor: 'blue',
          pointRadius: 0,
          fill: {
            target: 1,
            below: 'rgba(255, 0, 0, 0.4)',
            above: 'rgba(53, 221, 53, 0.4)',
          }
        },
        {
          data: [400, 200, 400, 200],
          cubicInterpolationMode: 'monotone',
          tension: 0.4,
          spanGaps: true,
          borderColor: 'orange',
          pointRadius: 0,
        },
      ]
    },
    options: {
      indexAxis: 'y',
      // maintainAspectRatio: false,
      plugins: {
        filler: {
          propagate: false
        },
        datalabels: {
          display: false
        },
        legend: {
          display: false
        },
      }
    }
  }
};

module.exports = {
  config: {
    colorMode: 'dark',
    type: 'line',
    data: {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      datasets: [{
        data: [-73, -1, -2, 96, 16, 5, -52],
      }, {
        borderDash: [5, 5],
        data: [11, 18, -33, 66, -80, 34, 65],
      }, {
        data: [-7, 35, 92, -79, 52, 29, -12],
        fill: true,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: false,
        title: false,
        tooltip: false,
      },
      scales: {
        x: {
          display: true,
          ticks: {
            display: false
          }
        },
        y: {
          display: true,
          ticks: {
            display: false
          }
        }
      }
    },
    plugins: [{
      id: 'background',
      beforeDraw(chart) {
        const ctx = chart.ctx;
        ctx.save();
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, chart.width, chart.height);
        ctx.restore();
      }
    }]
  },
  options: {
    run() {
      // Reset to light mode
      Chart.defaults.set(Chart.defaults.colors.light);
      Chart.defaults.set('colors', {mode: 'light'});
    }
  }
};

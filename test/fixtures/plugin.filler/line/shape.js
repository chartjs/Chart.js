const data = [];
for (let rad = 0; rad <= Math.PI * 2; rad += Math.PI / 45) {
  data.push({
    x: Math.cos(rad),
    y: Math.sin(rad)
  });
}

module.exports = {
  config: {
    type: 'line',
    data: {
      datasets: [{
        data,
        fill: 'shape',
        backgroundColor: 'rgba(255, 0, 0, 0.5)',
      }]
    },
    options: {
      plugins: {
        legend: false
      },
      scales: {
        x: {
          type: 'linear',
          display: false
        },
        y: {
          type: 'linear',
          display: false
        },
      },
    }
  }
};

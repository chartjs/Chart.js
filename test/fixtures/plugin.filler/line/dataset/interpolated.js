const data1 = [];
const data2 = [];
const data3 = [];
for (let i = 0; i < 200; i++) {
  const a = i / Math.PI / 10;

  data1.push({x: i, y: i < 86 || i > 104 && i < 178 ? Math.sin(a) : NaN});

  if (i % 10 === 0) {
    data2.push({x: i, y: Math.cos(a)});
  }

  if (i % 15 === 0) {
    data3.push({x: i, y: Math.cos(a + Math.PI / 2)});
  }
}

module.exports = {
  config: {
    type: 'line',
    data: {
      datasets: [{
        borderColor: 'rgba(255, 0, 0, 0.5)',
        backgroundColor: 'rgba(255, 0, 0, 0.25)',
        data: data1,
        fill: false,
      }, {
        borderColor: 'rgba(0, 0, 255, 0.5)',
        backgroundColor: 'rgba(0, 0, 255, 0.25)',
        data: data2,
        fill: 0,
      }, {
        borderColor: 'rgba(0, 255, 0, 0.5)',
        backgroundColor: 'rgba(0, 255, 0, 0.25)',
        data: data3,
        fill: 1,
      }]
    },
    options: {
      animation: false,
      responsive: false,
      datasets: {
        line: {
          tension: 0.4,
          borderWidth: 1,
          pointRadius: 1.5,
        }
      },
      plugins: {
        legend: false,
        title: false,
        tooltip: false
      },
      scales: {
        x: {
          type: 'linear',
          display: false
        },
        y: {
          type: 'linear',
          display: false
        }
      }
    }
  },
  options: {
    canvas: {
      height: 512,
      width: 512
    }
  }
};

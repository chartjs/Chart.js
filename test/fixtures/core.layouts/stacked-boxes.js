module.exports = {
  config: {
    type: 'line',
    data: {
      datasets: [
        {data: [{x: 1, y: 1}, {x: 2, y: 2}, {x: 3, y: 3}], borderColor: 'red'},
        {data: [{x: 1, y: 1}, {x: 2, y: 2}, {x: 3, y: 3}], yAxisID: 'y1', xAxisID: 'x1', borderColor: 'green'},
        {data: [{x: 1, y: 1}, {x: 2, y: 2}, {x: 3, y: 3}], yAxisID: 'y2', xAxisID: 'x2', borderColor: 'blue'},
      ],
      labels: ['tick1', 'tick2', 'tick3']
    },
    options: {
      plugins: false,
      scales: {
        x: {
          type: 'linear',
          position: 'bottom',
          stack: '1',
          offset: true,
          bounds: 'data',
          grid: {
            borderColor: 'red'
          },
          ticks: {
            autoSkip: false,
            maxRotation: 0,
            count: 3
          }
        },
        x1: {
          type: 'linear',
          position: 'bottom',
          stack: '1',
          offset: true,
          bounds: 'data',
          grid: {
            borderColor: 'green'
          },
          ticks: {
            autoSkip: false,
            maxRotation: 0,
            count: 3
          }
        },
        x2: {
          type: 'linear',
          position: 'bottom',
          stack: '1',
          offset: true,
          bounds: 'data',
          grid: {
            borderColor: 'blue'
          },
          ticks: {
            autoSkip: false,
            maxRotation: 0,
            count: 3
          }
        },
        y: {
          type: 'linear',
          position: 'left',
          stack: '1',
          offset: true,
          grid: {
            borderColor: 'red'
          },
          ticks: {
            precision: 0
          }
        },
        y1: {
          type: 'linear',
          position: 'left',
          stack: '1',
          offset: true,
          grid: {
            borderColor: 'green'
          },
          ticks: {
            precision: 0
          }
        },
        y2: {
          type: 'linear',
          position: 'left',
          stack: '1',
          offset: true,
          grid: {
            borderColor: 'blue'
          },
          ticks: {
            precision: 0
          }
        }
      }
    }
  },
  options: {
    spriteText: true,
    canvas: {
      height: 384,
      width: 384
    }
  }
};

module.exports = {
  config: {
    type: 'line',
    data: {
      datasets: [
        {data: [{x: 5, y: 1}, {x: 10, y: 2}, {x: 5, y: 3}], borderColor: 'red'},
        {data: [{x: 5, y: 1}, {x: 10, y: 2}, {x: 5, y: 3}], yAxisID: 'y1', xAxisID: 'x1', borderColor: 'green'},
        {data: [{x: 5, y: 1}, {x: 10, y: 2}, {x: 5, y: 3}], yAxisID: 'y2', xAxisID: 'x2', borderColor: 'blue'},
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
          clip: false,
          bounds: 'data',
          border: {
            color: 'red'
          },
          ticks: {
            autoSkip: false,
            maxRotation: 0,
            count: 3
          },
          max: 7
        },
        x1: {
          type: 'linear',
          position: 'bottom',
          stack: '1',
          offset: true,
          clip: false,
          bounds: 'data',
          border: {
            color: 'green'
          },
          ticks: {
            autoSkip: false,
            maxRotation: 0,
            count: 3
          },
          max: 7
        },
        x2: {
          type: 'linear',
          position: 'bottom',
          stack: '1',
          offset: true,
          clip: false,
          bounds: 'data',
          border: {
            color: 'blue'
          },
          ticks: {
            autoSkip: false,
            maxRotation: 0,
            count: 3
          },
          max: 7
        },
        y: {
          type: 'linear',
          position: 'left',
          stack: '1',
          offset: true,
          clip: false,
          border: {
            color: 'red'
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
          clip: false,
          border: {
            color: 'green'
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
          clip: false,
          border: {
            color: 'blue',
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

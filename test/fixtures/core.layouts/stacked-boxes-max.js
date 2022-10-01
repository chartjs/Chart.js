module.exports = {
  config: {
    type: 'line',
    data: {
      datasets: [
        {data: [{x: 1, y: 5}, {x: 2, y: 10}, {x: 3, y: 5}], borderColor: 'red'},
        {data: [{x: 1, y: 5}, {x: 2, y: 10}, {x: 3, y: 5}], yAxisID: 'y1', xAxisID: 'x1', borderColor: 'green'},
        {data: [{x: 1, y: 5}, {x: 2, y: 10}, {x: 3, y: 5}], yAxisID: 'y2', xAxisID: 'x2', borderColor: 'blue'},
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
          border: {
            color: 'red'
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
          border: {
            color: 'green'
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
          border: {
            color: 'blue'
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
          border: {
            color: 'red'
          },
          ticks: {
            precision: 0
          },
          max: 7
        },
        y1: {
          type: 'linear',
          position: 'left',
          stack: '1',
          offset: true,
          border: {
            color: 'green'
          },
          ticks: {
            precision: 0
          },
          max: 7
        },
        y2: {
          type: 'linear',
          position: 'left',
          stack: '1',
          offset: true,
          border: {
            color: 'blue',
          },
          ticks: {
            precision: 0
          },
          max: 7
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

module.exports = {
  config: {
    type: 'bubble',
    data: {
      datasets: [{
        data: [
          {x: 0, y: 0},
          {x: 1, y: 0},
          {x: 2, y: 0},
          {x: 3, y: 0},
          {x: 4, y: 0},
          {x: 5, y: 0}
        ],
        radius: function(ctx) {
          return ctx.dataset.data[ctx.dataIndex].x * 4;
        }
      }]
    },
    options: {
      scales: {
        x: {display: false},
        y: {display: false}
      },
      elements: {
        point: {
          backgroundColor: '#444'
        }
      },
      layout: {
        padding: {
          left: 24,
          right: 24
        }
      }
    }
  },
  options: {
    canvas: {
      height: 128,
      width: 256
    }
  }
};

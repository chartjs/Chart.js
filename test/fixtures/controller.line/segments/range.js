module.exports = {
  config: {
    type: 'line',
    data: {
      datasets: [{
        data: [{x: 0, y: 0}, {x: 1, y: 1}, {x: 2, y: 2}, {x: 3, y: 3}, {x: 4, y: 4}, {x: 5, y: 5}, {x: 6, y: 7}, {x: 7, y: 8}],
        borderColor: 'black',
        segments: {
          xRange: {
            range: {
              x: {min: 3, max: 4}
            },
            borderColor: 'red',
            borderDash: [5, 5]
          },
          yRange: {
            range: {
              y: {min: 5}
            },
            borderColor: 'green',
            borderDash: [5, 5]
          },
          xyRange: {
            range: {
              x: {min: 0},
              y: {max: 1}
            },
            borderColor: 'blue'
          }
        }
      }]
    },
    options: {
      scales: {
        x: {type: 'linear', display: false},
        y: {display: false}
      }
    }
  }
};

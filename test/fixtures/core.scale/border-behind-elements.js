module.exports = {
  config: {
    type: 'bubble',
    data: {
      datasets: [
        {
          label: '# of Votes',
          data: [{x: 19, y: 3, r: 3}, {x: 2, y: 2, r: 60}],
          radius: 100,
          backgroundColor: 'pink'
        }
      ]
    },
    options: {
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          ticks: {
            display: false
          },
          border: {
            color: 'red',
            width: 5
          }
        },
        x: {
          ticks: {
            display: false
          },
          border: {
            color: 'red',
            width: 5
          }
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

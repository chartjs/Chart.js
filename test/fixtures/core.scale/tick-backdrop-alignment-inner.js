module.exports = {
  config: {
    type: 'line',
    data: {
      labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
      datasets: [
        {
          label: '# of Votes',
          data: [12, 19, 3, 5, 2, 3],
        },
        {
          label: '# of Points',
          data: [7, 11, 5, 8, 3, 7],
        }
      ]
    },
    options: {
      scales: {
        y: {
          ticks: {
            display: false,
          },
          grid: {
            lineWidth: 0
          }
        },
        x: {
          position: 'top',
          ticks: {
            color: 'transparent',
            backdropColor: 'red',
            showLabelBackdrop: true,
            align: 'inner',
          },
          grid: {
            lineWidth: 0
          }
        }
      }
    }
  },
  options: {
    canvas: {
      height: 256,
      width: 512
    }
  }
};

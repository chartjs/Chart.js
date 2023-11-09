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
        x: {
          position: 'top',
          ticks: {
            color: 'green',
            backdropColor: 'red',
            showLabelBackdrop: true,
            align: 'inner',
          },
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

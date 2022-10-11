const grid = {
  display: false
};
const title = {
  display: false,
};
module.exports = {
  config: {
    type: 'line',
    options: {
      events: [],
      scales: {
        top: {
          type: 'linear',
          position: 'top',
          ticks: {
            display: true,
            showLabelBackdrop: true,
            backdropColor: 'red',
            backdropPadding: 5,
            align: 'start',
            crossAlign: 'near',
          },
          grid,
          title
        },
        left: {
          type: 'linear',
          position: 'left',
          ticks: {
            display: true,
            showLabelBackdrop: true,
            backdropColor: 'green',
            backdropPadding: 5,
            crossAlign: 'center',
          },
          grid,
          title
        },
        bottom: {
          type: 'linear',
          position: 'bottom',
          ticks: {
            display: true,
            showLabelBackdrop: true,
            backdropColor: 'blue',
            backdropPadding: 5,
            align: 'end',
            crossAlign: 'far',
          },
          grid,
          title
        },
        right: {
          type: 'linear',
          position: 'right',
          ticks: {
            display: true,
            showLabelBackdrop: true,
            backdropColor: 'gray',
            backdropPadding: 5,
          },
          grid,
          title
        },
      }
    }
  },
  options: {
    canvas: {
      height: 256,
      width: 256
    },
    spriteText: true,
  }
};

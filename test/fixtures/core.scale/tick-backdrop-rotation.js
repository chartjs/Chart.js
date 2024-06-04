const grid = {
  display: false
};
const title = {
  display: false,
};
module.exports = {
  tolerance: 0.0016,
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
            minRotation: 45,
            backdropColor: 'blue',
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
            minRotation: 90,
            backdropColor: 'green',
            backdropPadding: {
              x: 2,
              y: 5
            },
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
            backdropPadding: {
              x: 5,
              y: 5
            },
            align: 'end',
            crossAlign: 'far',
            minRotation: 60,
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

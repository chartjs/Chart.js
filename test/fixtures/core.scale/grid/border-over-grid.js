module.exports = {
  config: {
    type: 'scatter',
    options: {
      scales: {
        x: {
          position: {y: 0},
          min: -10,
          max: 10,
          grid: {
            borderColor: 'black',
            borderWidth: 5,
            color: 'lightGray',
            lineWidth: 3,
          },
          ticks: {
            display: false
          },
        },
        y: {
          position: {x: 0},
          min: -10,
          max: 10,
          grid: {
            borderColor: 'black',
            borderWidth: 5,
            color: 'lightGray',
            lineWidth: 3,
          },
          ticks: {
            display: false
          },
        }
      }
    }
  }
};

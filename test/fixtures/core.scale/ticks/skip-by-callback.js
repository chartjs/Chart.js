module.exports = {
  description: 'https://github.com/chartjs/Chart.js/issues/8892',
  config: {
    type: 'line',
    data: {
      labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
      datasets: [
        {
          data: [12, 19, 3, 5, 2, 3],
        },
        {
          data: [7, 11, 5, 8, 3, 7],
        }
      ]
    },
    options: {
      scales: {
        x: {
          ticks: {
            callback: function(val, index) {
              if (index === 1) {
                return undefined;
              }
              if (index === 3) {
                return null;
              }
              return this.getLabelForValue(val);
            }
          }
        },
        y: {
          ticks: {
            callback: function(val, index) {
              return index % 2 === 0 ? '' + val : null;
            }
          }
        }
      },
    }
  },
  options: {
    spriteText: true
  }
};

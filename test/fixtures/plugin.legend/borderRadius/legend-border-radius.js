module.exports = {
  config: {
    type: 'line',
    data: {
      labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
      datasets: [
        {
          label: '# of Votes',
          data: [12, 19, 3, 5, 2, 3],
          borderWidth: 1,
          borderColor: '#FF0000',
          backgroundColor: '#00FF00',
        },
        {
          label: '# of Points',
          data: [7, 11, 5, 8, 3, 7],
          borderWidth: 2,
          borderColor: '#FF00FF',
          backgroundColor: '#0000FF',
        }
      ]
    },
    options: {
      scales: {
        x: {display: false},
        y: {display: false}
      },
      plugins: {
        title: false,
        tooltip: false,
        filler: false,
        legend: {
          labels: {
            generateLabels: (chart) => {
              const items = Chart.defaults.plugins.legend.labels.generateLabels(chart);

              for (const item of items) {
                item.borderRadius = 5;
              }

              return items;
            }
          }
        }
      }
    }
  },
  options: {
    spriteText: true,
    canvas: {
      width: 512,
      height: 256
    }
  }
};

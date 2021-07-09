module.exports = {
  config: {
    type: 'radar',
    data: {
      labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange', 'Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange', 'Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange', 'Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
      datasets: [{
        label: '# of Votes',
        data: [12, 19, 3, 5, 1, 3, 12, 19, 3, 5, 1, 3, 12, 19, 3, 5, 1, 3, 12, 19, 3, 5, 1, 3]
      }]
    },
    options: {
      scales: {
        r: {
          ticks: {
            display: false,
          },
          angleLines: {
            color: (ctx) => {
              return ctx.index % 2 === 0 ? 'green' : 'red';
            }
          },
          pointLabels: {
            display: false,
          }
        }
      },
    }
  },
  options: {
    spriteText: true,
    width: 300,
  }
};

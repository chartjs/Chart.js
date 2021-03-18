module.exports = {
  config: {
    type: 'line',
    data: {
      labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
      datasets: [
        {
          label: '# of Votes',
          data: [12, 19, 3, 5, 2, 3],
          borderWidth: 1
        },
        {
          label: '# of Points',
          data: [7, 11, 5, 8, 3, 7],
          borderWidth: 1
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
          position: 'left',
          maxWidth: 100
        }
      }
    }
  },
  options: {
    spriteText: true,
    canvas: {
      width: 150,
      height: 75
    }
  }
};

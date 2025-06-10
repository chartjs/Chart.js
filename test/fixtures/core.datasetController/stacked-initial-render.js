module.exports = {
  config: {
    type: 'line',
    data: {
      labels: [0, 1, 2, 3, 4, 5, 6],
      datasets: [
        {
          // option in dataset
          data: [9, 13, 15, 25, 22, 15, 21],
          stack: 'construction_stack',
          borderWidth: 10,
          borderColor: 'rgb(54, 162, 235)'
        },
        {
          data: [9, 13, 15, 25, 22, 15, 21],
          stack: 'construction_stack',
          borderWidth: 10,
          borderColor: 'rgb(255, 99, 132)'
        }
      ]
    },
    options: {
      scales: {
        x: {
          ticks: {
            display: false
          }
        },
        y: {
          ticks: {
            display: false
          }
        }
      },
      plugins: {
        legend: false,
        title: false,
        tooltip: false,
        filler: false
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

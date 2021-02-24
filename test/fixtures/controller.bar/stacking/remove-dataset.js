var barChartData = {
  labels: [0, 1, 2, 3, 4, 5, 6],
  datasets: [
    {
      backgroundColor: 'red',
      data: [
        // { x: 0, y: 0 },
        {x: 1, y: 5},
        {x: 2, y: 5},
        {x: 3, y: 5},
        {x: 4, y: 5},
        {x: 5, y: 5},
        {x: 6, y: 5}
      ]
    },
    {
      backgroundColor: 'blue',
      data: [
        {x: 0, y: 5},
        // { x: 1, y: 0 },
        {x: 2, y: 5},
        {x: 3, y: 5},
        {x: 4, y: 5},
        {x: 5, y: 5},
        {x: 6, y: 5}
      ]
    },
    {
      backgroundColor: 'green',
      data: [
        {x: 0, y: 5},
        {x: 1, y: 5},
        // { x: 2, y: 0 },
        {x: 3, y: 5},
        {x: 4, y: 5},
        {x: 5, y: 5},
        {x: 6, y: 5}
      ]
    },
    {
      backgroundColor: 'yellow',
      data: [
        {x: 0, y: 5},
        {x: 1, y: 5},
        {x: 2, y: 5},
        // {x: 3, y: 0 },
        {x: 4, y: 5},
        {x: 5, y: 5},
        {x: 6, y: 5}
      ]
    },
    {
      backgroundColor: 'purple',
      data: [
        {x: 0, y: 5},
        {x: 1, y: 5},
        {x: 2, y: 5},
        {x: 3, y: 5},
        // { x: 4, y: 0 },
        {x: 5, y: 5},
        {x: 6, y: 5}
      ]
    },
    {
      backgroundColor: 'grey',
      data: [
        {x: 0, y: 5},
        {x: 1, y: 5},
        {x: 2, y: 5},
        {x: 3, y: 5},
        {x: 4, y: 5},
        // { x: 5, y: 0 },
        {x: 6, y: 5}
      ]
    }
  ]
};

module.exports = {
  config: {
    type: 'bar',
    data: barChartData,
    options: {
      scales: {
        x: {
          display: false,
          stacked: true
        },
        y: {
          display: false,
          stacked: true
        }
      }
    }
  },
  options: {
    run(chart) {
      chart.data.datasets.splice(0, 1);
      chart.update();
    }
  }
};

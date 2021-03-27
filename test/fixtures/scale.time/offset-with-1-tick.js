const data = {
  datasets: [
    {
      label: 6,
      backgroundColor: 'red',
      data: [
        {
          x: '2021-03-24',
          y: 464
        }
      ]
    },
    {
      label: 1,
      backgroundColor: 'red',
      data: [
        {
          x: '2021-03-24',
          y: 464
        }
      ]
    },
    {
      label: 17,
      backgroundColor: 'blue',
      data: [
        {
          x: '2021-03-24',
          y: 390
        }
      ]
    }
  ]
};

module.exports = {
  description: 'https://github.com/chartjs/Chart.js/issues/8718',
  config: {
    type: 'bar',
    data,
    options: {
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'day',
          },
        },
        y: {
          display: false
        }
      }
    }
  },
  options: {
    spriteText: true,
    canvas: {width: 256, height: 128}
  }
};

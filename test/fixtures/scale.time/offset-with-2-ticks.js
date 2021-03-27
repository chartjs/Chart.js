const data = {
  datasets: [
    {
      label: 1,
      backgroundColor: 'orange',
      data: [
        {
          x: '2021-03-24',
          y: 464
        }
      ]
    },
    {
      label: 2,
      backgroundColor: 'red',
      data: [
        {
          x: '2021-03-24',
          y: 464
        }
      ]
    },
    {
      label: 3,
      backgroundColor: 'blue',
      data: [
        {
          x: '2021-03-24',
          y: 390
        }
      ]
    },
    {
      label: 4,
      backgroundColor: 'purple',
      data: [
        {
          x: '2021-03-25',
          y: 464
        }
      ]
    },
    {
      label: 5,
      backgroundColor: 'black',
      data: [
        {
          x: '2021-03-25',
          y: 464
        }
      ]
    },
    {
      label: 6,
      backgroundColor: 'cyan',
      data: [
        {
          x: '2021-03-25',
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

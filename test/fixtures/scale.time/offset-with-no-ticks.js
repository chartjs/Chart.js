const data = {
  datasets: [
    {
      data: [
        {
          x: moment('15/10/2020', 'DD/MM/YYYY').valueOf(),
          y: 55
        },
        {
          x: moment('18/10/2020', 'DD/MM/YYYY').valueOf(),
          y: 10
        },
        {
          x: moment('19/10/2020', 'DD/MM/YYYY').valueOf(),
          y: 15
        }
      ],
      backgroundColor: 'blue'
    },
    {
      data: [
        {
          x: moment('15/10/2020', 'DD/MM/YYYY').valueOf(),
          y: 6
        },
        {
          x: moment('18/10/2020', 'DD/MM/YYYY').valueOf(),
          y: 11
        },
        {
          x: moment('19/10/2020', 'DD/MM/YYYY').valueOf(),
          y: 16
        }
      ],
      backgroundColor: 'green',
    },
    {
      data: [
        {
          x: moment('15/10/2020', 'DD/MM/YYYY').valueOf(),
          y: 7
        },
        {
          x: moment('18/10/2020', 'DD/MM/YYYY').valueOf(),
          y: 12
        },
        {
          x: moment('19/10/2020', 'DD/MM/YYYY').valueOf(),
          y: 17
        }
      ],
      backgroundColor: 'red',
    }
  ]
};

module.exports = {
  description: 'https://github.com/chartjs/Chart.js/issues/7991',
  config: {
    type: 'bar',
    data,
    options: {
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'month',
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

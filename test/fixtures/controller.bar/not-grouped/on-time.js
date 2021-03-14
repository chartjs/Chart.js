const data1 = [
  {
    x: '2017-11-02T20:30:00.000Z',
    y: 27
  },
  {
    x: '2017-11-03T20:53:00.000Z',
    y: 30
  },
  {
    x: '2017-11-06T05:46:00.000Z',
    y: 19
  },
  {
    x: '2017-11-06T21:03:00.000Z',
    y: 28
  },
  {
    x: '2017-11-07T20:49:00.000Z',
    y: 29
  },
  {
    x: '2017-11-08T21:52:00.000Z',
    y: 33
  }
];

const data2 = [
  {
    x: '2017-11-03T13:07:00.000Z',
    y: 45
  },
  {
    x: '2017-11-04T04:50:00.000Z',
    y: 40
  },
  {
    x: '2017-11-06T12:48:00.000Z',
    y: 38
  },
  {
    x: '2017-11-07T12:28:00.000Z',
    y: 42
  },
  {
    x: '2017-11-08T12:45:00.000Z',
    y: 51
  },
  {
    x: '2017-11-09T05:23:00.000Z',
    y: 57
  }
];

const data3 = [
  {
    x: '2017-11-03T16:30:00.000Z',
    y: 32
  },
  {
    x: '2017-11-04T11:50:00.000Z',
    y: 34
  },
  {
    x: '2017-11-06T18:30:00.000Z',
    y: 28
  },
  {
    x: '2017-11-07T15:51:00.000Z',
    y: 31
  },
  {
    x: '2017-11-08T17:27:00.000Z',
    y: 36
  },
  {
    x: '2017-11-09T06:53:00.000Z',
    y: 31
  }
];

module.exports = {
  description: 'https://github.com/chartjs/Chart.js/issues/5139',
  config: {
    type: 'bar',
    data: {
      datasets: [
        {
          data: data1,
          backgroundColor: 'rgb(0,0,255)',
        },
        {
          data: data2,
          backgroundColor: 'rgb(255,0,0)',
        },
        {
          data: data3,
          backgroundColor: 'rgb(0,255,0)',
        },
      ]
    },
    options: {
      barThickness: 10,
      grouped: false,
      scales: {
        x: {
          bounds: 'ticks',
          type: 'time',
          offset: false,
          position: 'bottom',
          display: true,
          time: {
            isoWeekday: true,
            unit: 'day'
          },
          grid: {
            offset: false
          }
        },
        y: {
          beginAtZero: true,
          display: false
        }
      },
    }
  },
  options: {
    spriteText: true,
    canvas: {
      width: 1000,
      height: 300
    }
  }
};

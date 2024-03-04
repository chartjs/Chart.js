module.exports = {
  config: {
    type: 'bar',
    data: {
      datasets: [{
        data: [{
          x: ['1996-01-01', '1996-01-01'],
          y: '',
        }],
        backgroundColor: ['green'],
        barPercentage: 1,
        minBarLength: 20,
      },
      ],
    },
    options: {
      indexAxis: 'y',
      scales: {
        y: {display: false},
        x: {
          display: false,
          type: 'time',
          time: {unit: 'year'},
          min: '1995-01-01',
          max: '1996-01-01',
        },

      },
    }
  }
};

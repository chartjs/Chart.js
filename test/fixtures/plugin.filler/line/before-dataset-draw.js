module.exports = {
  config: {
    type: 'line',
    data: {
      labels: ['15:00', '16:00', '17:00', '18:00', '19:00', '20:00'],
      datasets: [
        {
          borderColor: '#00ADEE80',
          backgroundColor: '#00ADEE',
          data: [0, 1, 1, 2, 2, 0],
        },
        {
          borderColor: '#BD262880',
          backgroundColor: '#BD2628',
          data: [0, 2, 2, 1, 1, 1],
        }
      ]
    },
    options: {
      borderWidth: 4,
      fill: true,
      radius: 20,
      pointBackgroundColor: '#ffff',
      cubicInterpolationMode: 'monotone',
      plugins: {
        legend: false,
        filler: {
          drawTime: 'beforeDatasetDraw'
        }
      },
      scales: {
        x: {
          display: false,
        },
        y: {
          display: false
        }
      }
    }
  }
};

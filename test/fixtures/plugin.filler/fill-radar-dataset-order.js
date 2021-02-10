module.exports = {
  config: {
    type: 'radar',
    data: {
      labels: ['English', 'Maths', 'Physics', 'Chemistry', 'Biology', 'History'],
      datasets: [
        {
          order: 1,
          borderColor: '#D50000',
          backgroundColor: 'rgba(245, 205, 121,0.5)',
          data: [65, 75, 70, 80, 60, 80]
        },
        {
          order: 0,
          backgroundColor: 'rgba(0, 168, 255,1)',
          data: [54, 65, 60, 70, 70, 75]
        }
      ]
    },
    options: {
      plugins: {
        legend: false,
        title: false,
        tooltip: false
      },
      scales: {
        r: {
          display: false
        }
      }
    }
  }
};

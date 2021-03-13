module.exports = {
  tolerance: 0.002,
  config: {
    type: 'line',
    data: {
      labels: [
        'Aaron',
        'Adam',
        'Albert',
        'Alex',
        'Allan',
        'Aman',
        'Anthony',
        'Autoenrolment',
        'Avril',
        'Bernard'
      ],
      datasets: [{
        backgroundColor: 'rgba(252,233,79,0.5)',
        borderColor: 'rgba(252,233,79,1)',
        borderWidth: 1,
        data: [101,
          185,
          24,
          311,
          17,
          21,
          462,
          340,
          140,
          24
        ]
      }]
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: true,
        title: {
          display: true,
          text: 'test'
        }
      }
    }
  },
  options: {
    spriteText: true,
    canvas: {
      height: 185,
      width: 185
    }
  }
};

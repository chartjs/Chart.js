module.exports = {
  tolerance: 0.01,
  config: {
    type: 'radar',
    data: {
      labels: [
        ['VENTE ET', 'COMMERCIALISATION'],
        ['GESTION', 'FINANCIÈRE'],
        'NUMÉRIQUE',
        ['ADMINISTRATION', 'ET OPÉRATION'],
        ['RESSOURCES', 'HUMAINES'],
        'INNOVATION'
      ],
      datasets: [
        {
          backgroundColor: '#E43E51',
          label: 'Compétences entrepreunariales',
          data: [3, 2, 2, 1, 3, 1]
        }
      ]
    },
    options: {
      plugins: {
        legend: false,
        tooltip: false,
        filler: false
      },
      scales: {
        r: {
          min: 0,
          max: 3,
          pointLabels: {
            backdropColor: 'blue',
            backdropPadding: {left: 5, right: 5, top: 2, bottom: 2},
          },
          ticks: {
            display: false,
            stepSize: 1,
            maxTicksLimit: 1
          }
        }
      },
      responsive: true,
      maintainAspectRatio: false
    }
  },
  options: {
    spriteText: true
  }
};

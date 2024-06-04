module.exports = {
  threshold: 0.01,
  tolerance: 0.0015,
  config: {
    type: 'line',
    data: {
      datasets: [{data: [
        {x: 1687849697000, y: 904},
        {x: 1687817063000, y: 905},
        {x: 1687694268000, y: 913},
        {x: 1687609438000, y: 914},
        {x: 1687561387000, y: 916},
        {x: 1686875127000, y: 918},
        {x: 1686873138000, y: 920},
        {x: 1686872777000, y: 928},
        {x: 1686081641000, y: 915}
      ], fill: false}, {data: [
        {x: 1687816803000, y: 1105},
        {x: 1686869490000, y: 1114},
        {x: 1686869397000, y: 1103},
        {x: 1686869225000, y: 1091},
        {x: 1686556516000, y: 1078}
      ]}]
    },
    options: {
      scales: {
        x: {
          type: 'timeseries',
          bounds: 'data',
          time: {
            unit: 'day'
          },
          ticks: {
            source: 'auto'
          }
        },
        y: {
          display: false
        }
      }
    }
  },
  options: {
    spriteText: true
  }
};

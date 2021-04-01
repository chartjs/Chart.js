const data = [];
for (let x = 0; x < 3; x++) {
  for (let y = 0; y < 3; y++) {
    data.push({x, y});
  }
}

module.exports = {
  config: {
    type: 'scatter',
    data: {
      datasets: [{
        data,
        backgroundColor: 'red',
        radius: 1,
        hoverRadius: 0
      }],
    },
    options: {
      scales: {
        x: {display: false},
        y: {display: false}
      },
      plugins: {
        legend: false,
        title: {
          display: true,
          text: () => 'Title Text',
        },
        filler: false,
        tooltip: false
      },
    },

  },
  options: {
    spriteText: true,
    canvas: {
      height: 400,
      width: 400
    }
  }
};

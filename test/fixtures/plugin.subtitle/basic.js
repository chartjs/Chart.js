
module.exports = {
  config: {
    type: 'scatter',
    data: {
      datasets: [{
        data: [{x: 0, y: 0}, {x: 1, y: 1}, {x: 2, y: 2}],
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
          text: 'Title Text',
        },
        subtitle: {
          display: true,
          text: 'SubTitle Text',
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

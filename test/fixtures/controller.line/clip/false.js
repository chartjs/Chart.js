const data = [];
for (let x = 0.95; x < 1.15; x += 0.002) {
  data.push({x, y: x});
}

for (let x = 0.95; x < 1.15; x += 0.001) {
  data.push({x, y: 2.1 - x});
}

module.exports = {
  config: {
    type: 'scatter',
    data: {
      datasets: [{
        clip: false,
        radius: 8,
        borderWidth: 0,
        backgroundColor: (ctx) => ctx.type !== 'data' || ctx.raw.x < 1 || ctx.raw.x > 1.1 ? 'rgba(255,0,0,0.7)' : 'rgba(0,0,255,0.05)',
        data
      }]
    },
    options: {
      plugins: false,
      scales: {
        x: {
          min: 1,
          max: 1.1
        },
        y: {
          min: 1,
          max: 1.1
        },
      },
      layout: {
        padding: 32
      }
    }
  },
  options: {
    spriteText: true,
    canvas: {
      height: 240,
      width: 320
    }
  }
};

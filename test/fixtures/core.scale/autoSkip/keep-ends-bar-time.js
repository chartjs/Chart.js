const data = [];
for (let day = 0; day <= 24; day += 7) {
  data.push({x: Date.UTC(2024, 0, 1 + day), y: day + 2});
}

module.exports = {
  description: 'ticks.autoSkipKeepEnds: weekly bars as wide as without the kept last tick',
  config: {
    type: 'bar',
    data: {
      datasets: [{data, backgroundColor: 'rgba(54, 162, 235, 0.5)'}]
    },
    options: {
      plugins: {legend: false},
      scales: {
        x: {
          type: 'time',
          min: Date.UTC(2024, 0, 1),
          max: Date.UTC(2024, 0, 25),
          time: {unit: 'day'},
          ticks: {source: 'auto', maxRotation: 0, autoSkipKeepEnds: true}
        },
        y: {display: false}
      }
    }
  },
  options: {
    spriteText: true,
    canvas: {
      width: 270,
      height: 100
    }
  }
};

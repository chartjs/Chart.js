// Should generate max and min that are not equal when data contains values that are very close to each other

module.exports = {
  config: {
    type: 'scatter',
    data: {
      datasets: [{
        data: [
          {x: 1, y: 1.8548483304974972},
          {x: 2, y: 1.8548483304974974},
        ]
      }],
    },
  },
  options: {
    spriteText: true
  }
};

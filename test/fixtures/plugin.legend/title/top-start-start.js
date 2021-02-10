module.exports = {
  config: {
    type: 'line',
    data: {
      datasets: [
        {label: 'a', data: []},
        {label: 'b', data: []},
        {label: 'c', data: []}
      ]
    },
    options: {
      plugins: {
        legend: {
          position: 'top',
          align: 'start',
          title: {
            display: true,
            position: 'start',
            text: 'title'
          }
        }
      },
      scales: {
        x: {display: false},
        y: {display: false}
      }
    }
  },
  options: {
    spriteText: true,
    canvas: {
      height: 256,
      width: 256
    }
  }
};

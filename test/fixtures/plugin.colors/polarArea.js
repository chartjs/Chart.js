module.exports = {
  config: {
    type: 'polarArea',
    data: {
      labels: [0, 1, 2, 3, 4, 5],
      datasets: [
        {
          data: [0, 2, 4, null, 6, 8]
        }
      ]
    },
    options: {
      plugins: {
        colors: {
          enabled: true
        }
      }
    }
  }
};

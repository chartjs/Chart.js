module.exports = {
  config: {
    type: 'doughnut',
    data: {
      labels: [0, 1, 2, 3, 4, 5],
      datasets: [
        {
          data: [60, 15, 33, 44, 12],
          // Radius is large enough to clip
          borderRadius: 200,
          backgroundColor: [
            'rgb(255, 99, 132)',
            'rgb(255, 159, 64)',
            'rgb(255, 205, 86)',
            'rgb(75, 192, 192)',
            'rgb(54, 162, 235)'
          ]
        },
      ]
    },
    // options: {
    //   elements: {
    //     arc: {
    //       backgroundColor: 'transparent',
    //       borderColor: '#888',
    //     }
    //   },
    // }
  },
  options: {
    canvas: {
      height: 256,
      width: 512
    }
  }
};

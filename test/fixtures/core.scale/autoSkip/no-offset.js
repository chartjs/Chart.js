module.exports = {
  description: 'https://github.com/chartjs/Chart.js/issues/8611',
  config: {
    type: 'line',
    data: {
      labels: ['Red Red Red', 'Blue Blue Blue', 'Black Black Black', 'Pink Pink Pink'],
      datasets: [
        {
          label: '# of Votes',
          data: [12, 19, 3, 5]
        },
      ]
    },
  },
  options: {
    spriteText: true,
    canvas: {
      width: 470,
      height: 128
    }
  }
};

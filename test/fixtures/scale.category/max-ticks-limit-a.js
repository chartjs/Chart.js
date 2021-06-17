const data = Array.from({length: 42}, (_, i) => i + 1);
const labels = data.map(v => 'tick' + v);

module.exports = {
  description: 'https://github.com/chartjs/Chart.js/issues/7302',
  config: {
    type: 'bar',
    data: {
      datasets: [{
        data
      }],
      labels
    },
    options: {
      scales: {
        x: {
          ticks: {
            display: false,
            maxTicksLimit: 7
          },
          grid: {
            color: 'red'
          }
        },
        y: {display: false}
      },
      layout: {
        padding: {
          right: 2
        }
      }
    }
  },
  options: {
    spriteText: true
  }
};

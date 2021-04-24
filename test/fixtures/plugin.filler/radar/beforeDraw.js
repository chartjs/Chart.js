module.exports = {
  config: {
    type: 'radar',
    data: {
      labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
      datasets: [{
        label: '# of Votes',
        data: [9, 7, 3, 5, 2, 3],
        fill: 'origin',
        borderColor: 'red',
        backgroundColor: 'green',
        pointRadius: 12,
        pointBackgroundColor: 'red'
      }]
    },
    options: {
      layout: {
        padding: 20
      },
      plugins: {
        legend: false,
        filler: {
          drawTime: 'beforeDraw'
        }
      },
      scales: {
        r: {
          angleLines: {
            color: 'rgba(0,0,0,0.5)',
            lineWidth: 2
          },
          grid: {
            color: 'rgba(0,0,0,0.5)',
            lineWidth: 2
          },
          pointLabels: {
            display: false
          },
          ticks: {
            beginAtZero: true,
            display: false
          },
        }
      }
    }
  }
};

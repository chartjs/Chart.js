module.exports = {
  config: {
    type: 'line',
    data: {
      labels: ['0', '1', '2', '3'],
      datasets: [{
        backgroundColor: 'rgba(255, 0, 0, 0.5)',
        data: [null, 1, 1, 1],
        fill: 'stack'
      }, {
        backgroundColor: 'rgba(0, 255, 0, 0.5)',
        data: [null, 2, 2, 2],
        fill: 'stack'
      }, {
        backgroundColor: 'rgba(0, 0, 255, 0.5)',
        data: [null, 3, 3, 3],
        fill: 'stack'
      }, {
        backgroundColor: 'rgba(255, 0, 255, 0.5)',
        data: [0.5, 0.5, 0.5, null],
        fill: 'stack',
        yAxisID: 'y2'
      }, {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        data: [1.5, 1.5, 1.5, null],
        fill: 'stack',
        yAxisID: 'y2'
      }, {
        backgroundColor: 'rgba(255, 255, 0, 0.5)',
        data: [2.5, 2.5, 2.5, null],
        fill: 'stack',
        yAxisID: 'y2'
      }]
    },
    options: {
      responsive: false,
      spanGaps: false,
      scales: {
        x: {
          display: false
        },
        y: {
          position: 'right',
          stacked: true,
          min: 0
        },
        y2: {
          position: 'left',
          stacked: true,
          min: 0
        }
      },
      elements: {
        point: {
          radius: 0
        },
        line: {
          borderColor: 'transparent',
          tension: 0
        }
      },
      plugins: {
        legend: false,
        title: false,
        tooltip: false
      }
    }
  },
  options: {
    spriteText: true,
    canvas: {
      height: 256,
      width: 512
    }
  }
};

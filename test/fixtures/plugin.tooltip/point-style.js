const pointStyles = ['circle', 'cross', 'crossRot', 'dash', 'line', 'rect', 'rectRounded', 'rectRot', 'star', 'triangle', false];

function newDataset(pointStyle, i) {
  return {
    label: '',
    data: pointStyles.map(() => i),
    pointStyle: pointStyle,
    pointBackgroundColor: '#0000ff',
    pointBorderColor: '#00ff00',
    showLine: false
  };
}
module.exports = {
  config: {
    type: 'line',
    data: {
      datasets: pointStyles.map((pointStyle, i) => newDataset(pointStyle, i)),
      labels: pointStyles.map(() => '')
    },
    options: {
      scales: {
        x: {display: false},
        y: {display: false}
      },
      elements: {
        line: {
          fill: false
        }
      },
      plugins: {
        legend: false,
        title: false,
        filler: false,
        tooltip: {
          mode: 'nearest',
          intersect: false,
          padding: 5,
          usePointStyle: true,
          callbacks: {
            label: function() {
              return '\u200b';
            }
          }
        },
      },
      layout: {
        padding: 15
      }
    },
    plugins: [{
      afterDraw: function(chart) {
        var canvas = chart.canvas;
        var rect = canvas.getBoundingClientRect();
        var point, event;

        for (var i = 0; i < pointStyles.length; ++i) {
          point = chart.getDatasetMeta(i).data[i];
          event = {
            type: 'mousemove',
            target: canvas,
            clientX: rect.left + point.x,
            clientY: rect.top + point.y
          };
          chart._handleEvent(event);
          chart.tooltip.handleEvent(event);
          chart.tooltip.draw(chart.ctx);
        }
      }
    }]
  },
  options: {
    canvas: {
      height: 256,
      width: 512
    }
  }
};

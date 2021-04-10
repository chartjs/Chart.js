module.exports = {
  config: {
    type: 'line',
    data: {
      datasets: [{
        data: [8, 7, 6, 5],
        pointBorderColor: '#ff0000',
        pointBackgroundColor: '#00ff00',
        showLine: false
      }],
      labels: ['', '', '', '']
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
          callbacks: {
            label: function() {
              return '\u200b';
            },
            labelColor: function(tooltipItem) {
              const meta = tooltipItem.chart.getDatasetMeta(tooltipItem.datasetIndex);
              const options = meta.controller.getStyle(tooltipItem.dataIndex);
              return {
                borderColor: options.borderColor,
                backgroundColor: options.backgroundColor,
                borderWidth: 2,
                borderDash: [2, 2]
              };
            },
          }
        },
      },

      layout: {
        padding: 15
      }
    },
    plugins: [{
      afterDraw: function(chart) {
        const canvas = chart.canvas;
        const rect = canvas.getBoundingClientRect();
        const point = chart.getDatasetMeta(0).data[1];
        const event = {
          type: 'mousemove',
          target: canvas,
          clientX: rect.left + point.x,
          clientY: rect.top + point.y
        };
        chart._handleEvent(event);
        chart.tooltip.handleEvent(event);
        chart.tooltip.draw(chart.ctx);
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

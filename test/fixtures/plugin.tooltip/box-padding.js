const data = [];
for (let x = 0; x < 3; x++) {
  for (let y = 0; y < 3; y++) {
    data.push({x, y});
  }
}

module.exports = {
  config: {
    type: 'scatter',
    data: {
      datasets: [{
        data,
        backgroundColor: 'red',
        radius: 1,
        hoverRadius: 0
      }],
    },
    options: {
      scales: {
        x: {display: false},
        y: {display: false}
      },
      plugins: {
        legend: false,
        title: false,
        filler: false,
        tooltip: {
          mode: 'point',
          intersect: true,
          // spriteText: use white background to hide any gaps between fonts
          backgroundColor: 'white',
          borderColor: 'black',
          borderWidth: 1,
          callbacks: {
            label: () => 'label',
          },
          boxPadding: 30
        },
      },
    },
    plugins: [{
      afterDraw: function(chart) {
        const canvas = chart.canvas;
        const rect = canvas.getBoundingClientRect();
        const meta = chart.getDatasetMeta(0);
        let point, event;

        for (let i = 0; i < data.length; i++) {
          point = meta.data[i];
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
    spriteText: true,
    canvas: {
      height: 400,
      width: 500
    }
  }
};

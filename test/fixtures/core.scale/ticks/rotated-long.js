module.exports = {
  config: {
    type: 'line',
    data: {
      labels: ['Red Red Red Red', 'Blue Blue Blue Blue', 'Black Black Black Black', 'Green Green Green Green', 'Purple Purple Purple Purple', 'Orange Orange Orange Orange Orange Orange'],
      datasets: [
        {
          data: [12, 19, 3, 5, 2, 3]
        },
      ]
    },
    options: {
      plugins: {
        legend: false,
        tooltip: false,
        filler: false,
        title: false
      },
      scales: {
        bottom: {
          type: 'category',
          position: 'bottom'
        },
        top: {
          type: 'category',
          position: 'top'
        }
      }
    },
    plugins: [{
      afterDraw(chart) {
        const ctx = chart.ctx;
        ctx.save();
        ctx.strokeStyle = 'red';
        ctx.strokeRect(0, 0, chart.width, chart.height);
        ctx.restore();
      }
    }]
  },
  options: {
    spriteText: true,
    canvas: {
      width: 1024,
      height: 512
    }
  }
};

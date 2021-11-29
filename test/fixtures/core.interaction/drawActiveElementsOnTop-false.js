module.exports = {
    config: {
      type: 'bubble',
      data: {
        datasets: [{
          data: [
            { x: 1, y: 1, r: 80 },
            { x: 1, y: 1, r: 20 }
          ],
          drawActiveElementsOnTop: false,
          backgroundColor: (ctx) => (ctx.dataIndex === 1 ? "red" : "blue"),
          hoverBackgroundColor: "yellow",
          hoverRadius: 0,
        }]
      },
      options: {
        plugins: {
          tooltip: false,
          legend: false
        },
      }
    },
    options: {
      canvas: {
        width: 600,
        height: 400
      },
      async run(chart) {
        const point = chart.getDatasetMeta(0).data[0];
        await jasmine.triggerMouseEvent(chart, 'click', {y: point.y, x: point.x + 25});
      }
    }
  };
  
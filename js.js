var ctx = document.getElementById("myChart");
var myChart = new Chart(ctx, {
  type: "doughnut",
  data: {
    labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
    datasets: [
      {
        label: "# of Votes",
        data: [12, 19, 3, 5, 2, 3]
      }
    ]
  },
  options: {
    plugins: {
      legend: {
        position: 'right',
        labels: {
          textAlign: 'right',
        },
        // rtl: true,
      }
    }
  },
  plugins: [
    {
      id: "legend-hit-box",
      afterDraw(chart) {
        const ctx = chart.ctx;
        ctx.save();
        ctx.strokeStyle = "green";
        ctx.lineWidth = 1;

        const legend = chart.legend;
        legend.legendHitBoxes.forEach((box) => {

          ctx.strokeRect(box.left, box.top, 100, box.height);//i changed the box.width to 100
        });

        ctx.restore();
      }
    }
  ]
});

describe('Chart.animator', function() {
  it('should fire onProgress for each draw', async function() {
    let done;
    const complete = new Promise((resolve) => {
      done = resolve;
    });
    let count = 0;
    let drawCount = 0;
    const progress = (animation) => {
      count++;
      expect(animation.numSteps).toEqual(250);
      expect(animation.currentStep <= 250).toBe(true);
    };
    acquireChart({
      type: 'bar',
      data: {
        datasets: [
          {data: [10, 5, 0, 25, 78, -10]}
        ],
        labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick5', 'tick6']
      },
      options: {
        animation: {
          duration: 250,
          onProgress: progress,
          onComplete: function() {
            expect(count).toEqual(drawCount);
            done();
          }
        }
      },
      plugins: [{
        afterDraw() {
          drawCount++;
        }
      }]
    }, {
      canvas: {
        height: 150,
        width: 250
      },
    });
    await complete;
  });

  it('should not fail when adding no items', function() {
    const chart = {};
    Chart.animator.add(chart, undefined);
    Chart.animator.add(chart, []);
    Chart.animator.start(chart);
    expect(Chart.animator.running(chart)).toBe(false);
  });
});

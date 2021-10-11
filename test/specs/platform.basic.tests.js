describe('Platform.basic', function() {

  it('should automatically choose the BasicPlatform for offscreen canvas', function() {
    const chart = acquireChart({type: 'line'}, {useOffscreenCanvas: true});

    expect(chart.platform).toBeInstanceOf(Chart.platforms.BasicPlatform);

    chart.destroy();
  });

  it('should disable animations', function() {
    const chart = acquireChart({type: 'line', options: {animation: {}}}, {useOffscreenCanvas: true});

    expect(chart.options.animation).toEqual(false);

    chart.destroy();
  });


  it('supports choosing the BasicPlatform in a web worker', function(done) {
    const canvas = document.createElement('canvas');
    if (!canvas.transferControlToOffscreen) {
      pending();
    }
    const offscreenCanvas = canvas.transferControlToOffscreen();

    const worker = new Worker('base/test/BasicChartWebWorker.js');
    worker.onmessage = (event) => {
      worker.terminate();
      const {type, errorMessage} = event.data;
      if (type === 'error') {
        done.fail(errorMessage);
      } else if (type === 'success') {
        expect(type).toEqual('success');
        done();
      } else {
        done.fail('invalid message type sent by worker: ' + type);
      }
    };

    worker.postMessage({type: 'initialize', canvas: offscreenCanvas}, [offscreenCanvas]);
  });

  describe('with offscreenCanvas', function() {
    it('supports laying out a simple chart', function() {
      const chart = acquireChart({
        type: 'bar',
        data: {
          datasets: [
            {data: [10, 5, 0, 25, 78, -10]}
          ],
          labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick5', 'tick6']
        }
      }, {
        canvas: {
          height: 150,
          width: 250
        },
        useOffscreenCanvas: true,
      });

      expect(chart.platform).toBeInstanceOf(Chart.platforms.BasicPlatform);

      expect(chart.chartArea.bottom).toBeCloseToPixel(120);
      expect(chart.chartArea.left).toBeCloseToPixel(31);
      expect(chart.chartArea.right).toBeCloseToPixel(250);
      expect(chart.chartArea.top).toBeCloseToPixel(32);
    });

    it('supports resizing a chart', function() {
      const chart = acquireChart({
        type: 'bar',
        data: {
          datasets: [
            {data: [10, 5, 0, 25, 78, -10]}
          ],
          labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick5', 'tick6']
        }
      }, {
        canvas: {
          height: 150,
          width: 250
        },
        useOffscreenCanvas: true,
      });

      expect(chart.platform).toBeInstanceOf(Chart.platforms.BasicPlatform);

      const canvasElement = chart.canvas;
      canvasElement.height = 200;
      canvasElement.width = 300;
      chart.resize();

      expect(chart.chartArea.bottom).toBeCloseToPixel(150);
      expect(chart.chartArea.left).toBeCloseToPixel(31);
      expect(chart.chartArea.right).toBeCloseToPixel(300);
      expect(chart.chartArea.top).toBeCloseToPixel(32);
    });
  });
});

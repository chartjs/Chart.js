describe('Platform.basic', function() {

	it('should automatically choose the BasicPlatform for offscreen canvases', function() {
		const chart = acquireChart({type: 'line'}, {useOffscreenCanvas: true});

		expect(chart.platform).toBeInstanceOf(Chart.platforms.BasicPlatform);

		chart.destroy();
	});

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
		expect(chart.chartArea.left).toBeCloseToPixel(34);
		expect(chart.chartArea.right).toBeCloseToPixel(247);
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
		expect(chart.chartArea.left).toBeCloseToPixel(34);
		expect(chart.chartArea.right).toBeCloseToPixel(297);
		expect(chart.chartArea.top).toBeCloseToPixel(32);
	});
});

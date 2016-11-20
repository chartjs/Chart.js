// Test the rectangle element
describe('Core.Tooltip', function() {
	describe('index mode', function() {
		it('Should only use x distance when intersect is false', function() {
			var chartInstance = window.acquireChart({
				type: 'line',
				data: {
					datasets: [{
						label: 'Dataset 1',
						data: [10, 20, 30],
						pointHoverBorderColor: 'rgb(255, 0, 0)',
						pointHoverBackgroundColor: 'rgb(0, 255, 0)'
					}, {
						label: 'Dataset 2',
						data: [40, 40, 40],
						pointHoverBorderColor: 'rgb(0, 0, 255)',
						pointHoverBackgroundColor: 'rgb(0, 255, 255)'
					}],
					labels: ['Point 1', 'Point 2', 'Point 3']
				},
				options: {
					tooltips: {
						mode: 'index',
						intersect: false
					}
				}
			});

			// Trigger an event over top of the
			var meta = chartInstance.getDatasetMeta(0);
			var point = meta.data[1];

			var node = chartInstance.chart.canvas;
			var rect = node.getBoundingClientRect();

			var evt = new MouseEvent('mousemove', {
				view: window,
				bubbles: true,
				cancelable: true,
				clientX: rect.left + point._model.x,
				clientY: 0
			});

			// Manually trigger rather than having an async test
			node.dispatchEvent(evt);

			// Check and see if tooltip was displayed
			var tooltip = chartInstance.tooltip;
			var globalDefaults = Chart.defaults.global;

			expect(tooltip._view).toEqual(jasmine.objectContaining({
				// Positioning
				xPadding: 6,
				yPadding: 6,
				xAlign: 'left',
				yAlign: 'center',

				// Body
				bodyFontColor: '#fff',
				_bodyFontFamily: globalDefaults.defaultFontFamily,
				_bodyFontStyle: globalDefaults.defaultFontStyle,
				_bodyAlign: 'left',
				bodyFontSize: globalDefaults.defaultFontSize,
				bodySpacing: 2,

				// Title
				titleFontColor: '#fff',
				_titleFontFamily: globalDefaults.defaultFontFamily,
				_titleFontStyle: 'bold',
				titleFontSize: globalDefaults.defaultFontSize,
				_titleAlign: 'left',
				titleSpacing: 2,
				titleMarginBottom: 6,

				// Footer
				footerFontColor: '#fff',
				_footerFontFamily: globalDefaults.defaultFontFamily,
				_footerFontStyle: 'bold',
				footerFontSize: globalDefaults.defaultFontSize,
				_footerAlign: 'left',
				footerSpacing: 2,
				footerMarginTop: 6,

				// Appearance
				caretSize: 5,
				cornerRadius: 6,
				backgroundColor: 'rgba(0,0,0,0.8)',
				opacity: 1,
				legendColorBackground: '#fff',
				displayColors: true,

				// Text
				title: ['Point 2'],
				beforeBody: [],
				body: [{
					before: [],
					lines: ['Dataset 1: 20'],
					after: []
				}, {
					before: [],
					lines: ['Dataset 2: 40'],
					after: []
				}],
				afterBody: [],
				footer: [],
				caretPadding: 2,
				labelColors: [{
					borderColor: 'rgb(255, 0, 0)',
					backgroundColor: 'rgb(0, 255, 0)'
				}, {
					borderColor: 'rgb(0, 0, 255)',
					backgroundColor: 'rgb(0, 255, 255)'
				}]
			}));

			expect(tooltip._view.x).toBeCloseToPixel(263);
			expect(tooltip._view.y).toBeCloseToPixel(155);
		});

		it('Should only display if intersecting if intersect is set', function() {
			var chartInstance = window.acquireChart({
				type: 'line',
				data: {
					datasets: [{
						label: 'Dataset 1',
						data: [10, 20, 30],
						pointHoverBorderColor: 'rgb(255, 0, 0)',
						pointHoverBackgroundColor: 'rgb(0, 255, 0)'
					}, {
						label: 'Dataset 2',
						data: [40, 40, 40],
						pointHoverBorderColor: 'rgb(0, 0, 255)',
						pointHoverBackgroundColor: 'rgb(0, 255, 255)'
					}],
					labels: ['Point 1', 'Point 2', 'Point 3']
				},
				options: {
					tooltips: {
						mode: 'index',
						intersect: true
					}
				}
			});

			// Trigger an event over top of the
			var meta = chartInstance.getDatasetMeta(0);
			var point = meta.data[1];

			var node = chartInstance.chart.canvas;
			var rect = node.getBoundingClientRect();

			var evt = new MouseEvent('mousemove', {
				view: window,
				bubbles: true,
				cancelable: true,
				clientX: rect.left + point._model.x,
				clientY: 0
			});

			// Manually trigger rather than having an async test
			node.dispatchEvent(evt);

			// Check and see if tooltip was displayed
			var tooltip = chartInstance.tooltip;
			var globalDefaults = Chart.defaults.global;

			expect(tooltip._view).toEqual(jasmine.objectContaining({
				// Positioning
				xPadding: 6,
				yPadding: 6,

				// Body
				bodyFontColor: '#fff',
				_bodyFontFamily: globalDefaults.defaultFontFamily,
				_bodyFontStyle: globalDefaults.defaultFontStyle,
				_bodyAlign: 'left',
				bodyFontSize: globalDefaults.defaultFontSize,
				bodySpacing: 2,

				// Title
				titleFontColor: '#fff',
				_titleFontFamily: globalDefaults.defaultFontFamily,
				_titleFontStyle: 'bold',
				titleFontSize: globalDefaults.defaultFontSize,
				_titleAlign: 'left',
				titleSpacing: 2,
				titleMarginBottom: 6,

				// Footer
				footerFontColor: '#fff',
				_footerFontFamily: globalDefaults.defaultFontFamily,
				_footerFontStyle: 'bold',
				footerFontSize: globalDefaults.defaultFontSize,
				_footerAlign: 'left',
				footerSpacing: 2,
				footerMarginTop: 6,

				// Appearance
				caretSize: 5,
				cornerRadius: 6,
				backgroundColor: 'rgba(0,0,0,0.8)',
				opacity: 0,
				legendColorBackground: '#fff',
				displayColors: true,
			}));
		});
	});

	it('Should display in single mode', function() {
		var chartInstance = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					label: 'Dataset 1',
					data: [10, 20, 30],
					pointHoverBorderColor: 'rgb(255, 0, 0)',
					pointHoverBackgroundColor: 'rgb(0, 255, 0)'
				}, {
					label: 'Dataset 2',
					data: [40, 40, 40],
					pointHoverBorderColor: 'rgb(0, 0, 255)',
					pointHoverBackgroundColor: 'rgb(0, 255, 255)'
				}],
				labels: ['Point 1', 'Point 2', 'Point 3']
			},
			options: {
				tooltips: {
					mode: 'single'
				}
			}
		});

		// Trigger an event over top of the
		var meta = chartInstance.getDatasetMeta(0);
		var point = meta.data[1];

		var node = chartInstance.chart.canvas;
		var rect = node.getBoundingClientRect();

		var evt = new MouseEvent('mousemove', {
			view: window,
			bubbles: true,
			cancelable: true,
			clientX: rect.left + point._model.x,
			clientY: rect.top + point._model.y
		});

		// Manually trigger rather than having an async test
		node.dispatchEvent(evt);

		// Check and see if tooltip was displayed
		var tooltip = chartInstance.tooltip;
		var globalDefaults = Chart.defaults.global;

		expect(tooltip._view).toEqual(jasmine.objectContaining({
			// Positioning
			xPadding: 6,
			yPadding: 6,
			xAlign: 'left',
			yAlign: 'center',

			// Body
			bodyFontColor: '#fff',
			_bodyFontFamily: globalDefaults.defaultFontFamily,
			_bodyFontStyle: globalDefaults.defaultFontStyle,
			_bodyAlign: 'left',
			bodyFontSize: globalDefaults.defaultFontSize,
			bodySpacing: 2,

			// Title
			titleFontColor: '#fff',
			_titleFontFamily: globalDefaults.defaultFontFamily,
			_titleFontStyle: 'bold',
			titleFontSize: globalDefaults.defaultFontSize,
			_titleAlign: 'left',
			titleSpacing: 2,
			titleMarginBottom: 6,

			// Footer
			footerFontColor: '#fff',
			_footerFontFamily: globalDefaults.defaultFontFamily,
			_footerFontStyle: 'bold',
			footerFontSize: globalDefaults.defaultFontSize,
			_footerAlign: 'left',
			footerSpacing: 2,
			footerMarginTop: 6,

			// Appearance
			caretSize: 5,
			cornerRadius: 6,
			backgroundColor: 'rgba(0,0,0,0.8)',
			opacity: 1,
			legendColorBackground: '#fff',
			displayColors: true,

			// Text
			title: ['Point 2'],
			beforeBody: [],
			body: [{
				before: [],
				lines: ['Dataset 1: 20'],
				after: []
			}],
			afterBody: [],
			footer: [],
			caretPadding: 2,
			labelColors: [{
				borderColor: 'rgb(255, 0, 0)',
				backgroundColor: 'rgb(0, 255, 0)'
			}]
		}));

		expect(tooltip._view.x).toBeCloseToPixel(263);
		expect(tooltip._view.y).toBeCloseToPixel(312);
	});

	it('Should display information from user callbacks', function() {
		var chartInstance = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					label: 'Dataset 1',
					data: [10, 20, 30],
					pointHoverBorderColor: 'rgb(255, 0, 0)',
					pointHoverBackgroundColor: 'rgb(0, 255, 0)'
				}, {
					label: 'Dataset 2',
					data: [40, 40, 40],
					pointHoverBorderColor: 'rgb(0, 0, 255)',
					pointHoverBackgroundColor: 'rgb(0, 255, 255)'
				}],
				labels: ['Point 1', 'Point 2', 'Point 3']
			},
			options: {
				tooltips: {
					mode: 'label',
					callbacks: {
						beforeTitle: function() {
							return 'beforeTitle';
						},
						title: function() {
							return 'title';
						},
						afterTitle: function() {
							return 'afterTitle';
						},
						beforeBody: function() {
							return 'beforeBody';
						},
						beforeLabel: function() {
							return 'beforeLabel';
						},
						label: function() {
							return 'label';
						},
						afterLabel: function() {
							return 'afterLabel';
						},
						afterBody: function() {
							return 'afterBody';
						},
						beforeFooter: function() {
							return 'beforeFooter';
						},
						footer: function() {
							return 'footer';
						},
						afterFooter: function() {
							return 'afterFooter';
						}
					}
				}
			}
		});

		// Trigger an event over top of the
		var meta = chartInstance.getDatasetMeta(0);
		var point = meta.data[1];

		var node = chartInstance.chart.canvas;
		var rect = node.getBoundingClientRect();

		var evt = new MouseEvent('mousemove', {
			view: window,
			bubbles: true,
			cancelable: true,
			clientX: rect.left + point._model.x,
			clientY: rect.top + point._model.y
		});

		// Manually trigger rather than having an async test
		node.dispatchEvent(evt);

		// Check and see if tooltip was displayed
		var tooltip = chartInstance.tooltip;
		var globalDefaults = Chart.defaults.global;

		expect(tooltip._view).toEqual(jasmine.objectContaining({
			// Positioning
			xPadding: 6,
			yPadding: 6,
			xAlign: 'center',
			yAlign: 'top',

			// Body
			bodyFontColor: '#fff',
			_bodyFontFamily: globalDefaults.defaultFontFamily,
			_bodyFontStyle: globalDefaults.defaultFontStyle,
			_bodyAlign: 'left',
			bodyFontSize: globalDefaults.defaultFontSize,
			bodySpacing: 2,

			// Title
			titleFontColor: '#fff',
			_titleFontFamily: globalDefaults.defaultFontFamily,
			_titleFontStyle: 'bold',
			titleFontSize: globalDefaults.defaultFontSize,
			_titleAlign: 'left',
			titleSpacing: 2,
			titleMarginBottom: 6,

			// Footer
			footerFontColor: '#fff',
			_footerFontFamily: globalDefaults.defaultFontFamily,
			_footerFontStyle: 'bold',
			footerFontSize: globalDefaults.defaultFontSize,
			_footerAlign: 'left',
			footerSpacing: 2,
			footerMarginTop: 6,

			// Appearance
			caretSize: 5,
			cornerRadius: 6,
			backgroundColor: 'rgba(0,0,0,0.8)',
			opacity: 1,
			legendColorBackground: '#fff',

			// Text
			title: ['beforeTitle', 'title', 'afterTitle'],
			beforeBody: ['beforeBody'],
			body: [{
				before: ['beforeLabel'],
				lines: ['label'],
				after: ['afterLabel']
			}, {
				before: ['beforeLabel'],
				lines: ['label'],
				after: ['afterLabel']
			}],
			afterBody: ['afterBody'],
			footer: ['beforeFooter', 'footer', 'afterFooter'],
			caretPadding: 2,
			labelColors: [{
				borderColor: 'rgb(255, 0, 0)',
				backgroundColor: 'rgb(0, 255, 0)'
			}, {
				borderColor: 'rgb(0, 0, 255)',
				backgroundColor: 'rgb(0, 255, 255)'
			}]
		}));

		expect(tooltip._view.x).toBeCloseToPixel(211);
		expect(tooltip._view.y).toBeCloseToPixel(190);
	});

	it('Should display information from user callbacks', function() {
		var chartInstance = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					label: 'Dataset 1',
					data: [10, 20, 30],
					pointHoverBorderColor: 'rgb(255, 0, 0)',
					pointHoverBackgroundColor: 'rgb(0, 255, 0)'
				}, {
					label: 'Dataset 2',
					data: [40, 40, 40],
					pointHoverBorderColor: 'rgb(0, 0, 255)',
					pointHoverBackgroundColor: 'rgb(0, 255, 255)'
				}],
				labels: ['Point 1', 'Point 2', 'Point 3']
			},
			options: {
				tooltips: {
					mode: 'label',
					itemSort: function(a, b) {
						return a.datasetIndex > b.datasetIndex ? -1 : 1;
					}
				}
			}
		});

		// Trigger an event over top of the
		var meta0 = chartInstance.getDatasetMeta(0);
		var point0 = meta0.data[1];

		var node = chartInstance.chart.canvas;
		var rect = node.getBoundingClientRect();

		var evt = new MouseEvent('mousemove', {
			view: window,
			bubbles: true,
			cancelable: true,
			clientX: rect.left + point0._model.x,
			clientY: rect.top + point0._model.y
		});

		// Manually trigger rather than having an async test
		node.dispatchEvent(evt);

		// Check and see if tooltip was displayed
		var tooltip = chartInstance.tooltip;

		expect(tooltip._view).toEqual(jasmine.objectContaining({
			// Positioning
			xAlign: 'left',
			yAlign: 'center',

			// Text
			title: ['Point 2'],
			beforeBody: [],
			body: [{
				before: [],
				lines: ['Dataset 2: 40'],
				after: []
			}, {
				before: [],
				lines: ['Dataset 1: 20'],
				after: []
			}],
			afterBody: [],
			footer: [],
			labelColors: [{
				borderColor: 'rgb(0, 0, 255)',
				backgroundColor: 'rgb(0, 255, 255)'
			}, {
				borderColor: 'rgb(255, 0, 0)',
				backgroundColor: 'rgb(0, 255, 0)'
			}]
		}));

		expect(tooltip._view.x).toBeCloseToPixel(263);
		expect(tooltip._view.y).toBeCloseToPixel(155);
	});

	it('should filter items from the tooltip using the callback', function() {
		var chartInstance = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					label: 'Dataset 1',
					data: [10, 20, 30],
					pointHoverBorderColor: 'rgb(255, 0, 0)',
					pointHoverBackgroundColor: 'rgb(0, 255, 0)',
					tooltipHidden: true
				}, {
					label: 'Dataset 2',
					data: [40, 40, 40],
					pointHoverBorderColor: 'rgb(0, 0, 255)',
					pointHoverBackgroundColor: 'rgb(0, 255, 255)'
				}],
				labels: ['Point 1', 'Point 2', 'Point 3']
			},
			options: {
				tooltips: {
					mode: 'label',
					filter: function(tooltipItem, data) {
						// For testing purposes remove the first dataset that has a tooltipHidden property
						return !data.datasets[tooltipItem.datasetIndex].tooltipHidden;
					}
				}
			}
		});

		// Trigger an event over top of the
		var meta0 = chartInstance.getDatasetMeta(0);
		var point0 = meta0.data[1];

		var node = chartInstance.chart.canvas;
		var rect = node.getBoundingClientRect();

		var evt = new MouseEvent('mousemove', {
			view: window,
			bubbles: true,
			cancelable: true,
			clientX: rect.left + point0._model.x,
			clientY: rect.top + point0._model.y
		});

		// Manually trigger rather than having an async test
		node.dispatchEvent(evt);

		// Check and see if tooltip was displayed
		var tooltip = chartInstance.tooltip;

		expect(tooltip._view).toEqual(jasmine.objectContaining({
			// Positioning
			xAlign: 'left',
			yAlign: 'center',

			// Text
			title: ['Point 2'],
			beforeBody: [],
			body: [{
				before: [],
				lines: ['Dataset 2: 40'],
				after: []
			}],
			afterBody: [],
			footer: [],
			labelColors: [{
				borderColor: 'rgb(0, 0, 255)',
				backgroundColor: 'rgb(0, 255, 255)'
			}]
		}));
	});

	it('Should have dataPoints', function() {
		var chartInstance = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					label: 'Dataset 1',
					data: [10, 20, 30],
					pointHoverBorderColor: 'rgb(255, 0, 0)',
					pointHoverBackgroundColor: 'rgb(0, 255, 0)'
				}, {
					label: 'Dataset 2',
					data: [40, 40, 40],
					pointHoverBorderColor: 'rgb(0, 0, 255)',
					pointHoverBackgroundColor: 'rgb(0, 255, 255)'
				}],
				labels: ['Point 1', 'Point 2', 'Point 3']
			},
			options: {
				tooltips: {
					mode: 'single'
				}
			}
		});

		// Trigger an event over top of the
		var pointIndex = 1;
		var datasetIndex = 0;
		var meta = chartInstance.getDatasetMeta(datasetIndex);
		var point = meta.data[pointIndex];
		var node = chartInstance.chart.canvas;
		var rect = node.getBoundingClientRect();
		var evt = new MouseEvent('mousemove', {
			view: window,
			bubbles: true,
			cancelable: true,
			clientX: rect.left + point._model.x,
			clientY: rect.top + point._model.y
		});

		// Manually trigger rather than having an async test
		node.dispatchEvent(evt);

		// Check and see if tooltip was displayed
		var tooltip = chartInstance.tooltip;

		expect(tooltip._view instanceof Object).toBe(true);
		expect(tooltip._view.dataPoints instanceof Array).toBe(true);
		expect(tooltip._view.dataPoints.length).toEqual(1);
		expect(tooltip._view.dataPoints[0].index).toEqual(pointIndex);
		expect(tooltip._view.dataPoints[0].datasetIndex).toEqual(datasetIndex);
		expect(tooltip._view.dataPoints[0].xLabel).toEqual(
			chartInstance.config.data.labels[pointIndex]
		);
		expect(tooltip._view.dataPoints[0].yLabel).toEqual(
			chartInstance.config.data.datasets[datasetIndex].data[pointIndex]
		);
		expect(tooltip._view.dataPoints[0].x).toBeCloseToPixel(point._model.x);
		expect(tooltip._view.dataPoints[0].y).toBeCloseToPixel(point._model.y);
	});
});

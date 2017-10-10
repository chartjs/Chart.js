// Test the rectangle element
describe('Core.Tooltip', function() {
	describe('config', function() {
		it('should not include the dataset label in the body string if not defined', function() {
			var data = {
				datasets: [{
					data: [10, 20, 30],
					pointHoverBorderColor: 'rgb(255, 0, 0)',
					pointHoverBackgroundColor: 'rgb(0, 255, 0)'
				}],
				labels: ['Point 1', 'Point 2', 'Point 3']
			};
			var tooltipItem = {
				index: 1,
				datasetIndex: 0,
				xLabel: 'Point 2',
				yLabel: '20'
			};

			var label = Chart.defaults.global.tooltips.callbacks.label(tooltipItem, data);
			expect(label).toBe('20');

			data.datasets[0].label = 'My dataset';
			label = Chart.defaults.global.tooltips.callbacks.label(tooltipItem, data);
			expect(label).toBe('My dataset: 20');
		});
	});

	describe('index mode', function() {
		it('Should only use x distance when intersect is false', function() {
			var chart = window.acquireChart({
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
						intersect: false,
					},
					hover: {
						mode: 'index',
						intersect: false
					}
				}
			});

			// Trigger an event over top of the
			var meta = chart.getDatasetMeta(0);
			var point = meta.data[1];

			var node = chart.canvas;
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
			var tooltip = chart.tooltip;
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

			expect(tooltip._view.x).toBeCloseToPixel(266);
			expect(tooltip._view.y).toBeCloseToPixel(155);
		});

		it('Should only display if intersecting if intersect is set', function() {
			var chart = window.acquireChart({
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
			var meta = chart.getDatasetMeta(0);
			var point = meta.data[1];

			var node = chart.canvas;
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
			var tooltip = chart.tooltip;
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
		var chart = window.acquireChart({
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
		var meta = chart.getDatasetMeta(0);
		var point = meta.data[1];

		var node = chart.canvas;
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
		var tooltip = chart.tooltip;
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
			labelTextColors: ['#fff'],
			labelColors: [{
				borderColor: 'rgb(255, 0, 0)',
				backgroundColor: 'rgb(0, 255, 0)'
			}]
		}));

		expect(tooltip._view.x).toBeCloseToPixel(266);
		expect(tooltip._view.y).toBeCloseToPixel(312);
	});

	it('Should display information from user callbacks', function() {
		var chart = window.acquireChart({
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
						},
						labelTextColor: function() {
							return 'labelTextColor';
						}
					}
				}
			}
		});

		// Trigger an event over top of the
		var meta = chart.getDatasetMeta(0);
		var point = meta.data[1];

		var node = chart.canvas;
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
		var tooltip = chart.tooltip;
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
			labelTextColors: ['labelTextColor', 'labelTextColor'],
			labelColors: [{
				borderColor: 'rgb(255, 0, 0)',
				backgroundColor: 'rgb(0, 255, 0)'
			}, {
				borderColor: 'rgb(0, 0, 255)',
				backgroundColor: 'rgb(0, 255, 255)'
			}]
		}));

		expect(tooltip._view.x).toBeCloseToPixel(214);
		expect(tooltip._view.y).toBeCloseToPixel(190);
	});

	it('Should allow sorting items', function() {
		var chart = window.acquireChart({
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
		var meta0 = chart.getDatasetMeta(0);
		var point0 = meta0.data[1];

		var node = chart.canvas;
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
		var tooltip = chart.tooltip;

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

		expect(tooltip._view.x).toBeCloseToPixel(266);
		expect(tooltip._view.y).toBeCloseToPixel(155);
	});

	it('should filter items from the tooltip using the callback', function() {
		var chart = window.acquireChart({
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
		var meta0 = chart.getDatasetMeta(0);
		var point0 = meta0.data[1];

		var node = chart.canvas;
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
		var tooltip = chart.tooltip;

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

	it('should set the caretPadding based on a config setting', function() {
		var chart = window.acquireChart({
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
					caretPadding: 10
				}
			}
		});

		// Trigger an event over top of the
		var meta0 = chart.getDatasetMeta(0);
		var point0 = meta0.data[1];

		var node = chart.canvas;
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
		var tooltip = chart.tooltip;

		expect(tooltip._model).toEqual(jasmine.objectContaining({
			// Positioning
			caretPadding: 10,
		}));
	});

	it('Should have dataPoints', function() {
		var chart = window.acquireChart({
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
		var meta = chart.getDatasetMeta(datasetIndex);
		var point = meta.data[pointIndex];
		var node = chart.canvas;
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
		var tooltip = chart.tooltip;

		expect(tooltip._view instanceof Object).toBe(true);
		expect(tooltip._view.dataPoints instanceof Array).toBe(true);
		expect(tooltip._view.dataPoints.length).toEqual(1);
		expect(tooltip._view.dataPoints[0].index).toEqual(pointIndex);
		expect(tooltip._view.dataPoints[0].datasetIndex).toEqual(datasetIndex);
		expect(tooltip._view.dataPoints[0].xLabel).toEqual(
			chart.data.labels[pointIndex]
		);
		expect(tooltip._view.dataPoints[0].yLabel).toEqual(
			chart.data.datasets[datasetIndex].data[pointIndex]
		);
		expect(tooltip._view.dataPoints[0].x).toBeCloseToPixel(point._model.x);
		expect(tooltip._view.dataPoints[0].y).toBeCloseToPixel(point._model.y);
	});

	it('Should not update if active element has not changed', function() {
		var chart = window.acquireChart({
			type: 'bar',
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
					mode: 'single',
					callbacks: {
						title: function() {
							return 'registering callback...';
						}
					}
				}
			}
		});

		// Trigger an event over top of the
		var meta = chart.getDatasetMeta(0);
		var firstPoint = meta.data[1];

		var node = chart.chart.canvas;
		var rect = node.getBoundingClientRect();

		var firstEvent = new MouseEvent('mousemove', {
			view: window,
			bubbles: false,
			cancelable: true,
			clientX: rect.left + firstPoint._model.x,
			clientY: rect.top + firstPoint._model.y
		});

		var tooltip = chart.tooltip;
		spyOn(tooltip, 'update');

		/* Manually trigger rather than having an async test */

		// First dispatch change event, should update tooltip
		node.dispatchEvent(firstEvent);
		expect(tooltip.update).toHaveBeenCalledWith(true);

		// Reset calls
		tooltip.update.calls.reset();

		// Second dispatch change event (same event), should not update tooltip
		node.dispatchEvent(firstEvent);
		expect(tooltip.update).not.toHaveBeenCalled();
	});

	describe('positioners', function() {
		it('Should call custom positioner with correct parameters and scope', function() {

			Chart.Tooltip.positioners.test = function() {
				return {x: 0, y: 0};
			};

			spyOn(Chart.Tooltip.positioners, 'test').and.callThrough();

			var chart = window.acquireChart({
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
						mode: 'nearest',
						position: 'test'
					}
				}
			});

			// Trigger an event over top of the
			var pointIndex = 1;
			var datasetIndex = 0;
			var meta = chart.getDatasetMeta(datasetIndex);
			var point = meta.data[pointIndex];
			var node = chart.canvas;
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

			var fn = Chart.Tooltip.positioners.test;
			expect(fn.calls.count()).toBe(1);
			expect(fn.calls.first().args[0] instanceof Array).toBe(true);
			expect(fn.calls.first().args[1].hasOwnProperty('x')).toBe(true);
			expect(fn.calls.first().args[1].hasOwnProperty('y')).toBe(true);
			expect(fn.calls.first().object instanceof Chart.Tooltip).toBe(true);
		});
	});
});

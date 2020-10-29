// Test the rectangle element
const tooltipPlugin = Chart.registry.getPlugin('tooltip');
const Tooltip = tooltipPlugin._element;

describe('Plugin.Tooltip', function() {
	describe('auto', jasmine.fixture.specs('core.tooltip'));

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
				dataset: data.datasets[0],
				label: 'Point 2',
				formattedValue: '20'
			};

			var label = Chart.defaults.plugins.tooltip.callbacks.label(tooltipItem);
			expect(label).toBe('20');

			data.datasets[0].label = 'My dataset';
			label = Chart.defaults.plugins.tooltip.callbacks.label(tooltipItem);
			expect(label).toBe('My dataset: 20');
		});
	});

	describe('index mode', function() {
		it('Should only use x distance when intersect is false', function(done) {
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

			afterEvent(chart, 'mousemove', function() {
				// Check and see if tooltip was displayed
				var tooltip = chart.tooltip;
				var defaults = Chart.defaults;

				expect(tooltip.options.xPadding).toEqual(6);
				expect(tooltip.options.yPadding).toEqual(6);
				expect(tooltip.xAlign).toEqual('left');
				expect(tooltip.yAlign).toEqual('center');

				expect(tooltip.options.bodyFont).toEqual(jasmine.objectContaining({
					color: '#fff',
					family: defaults.font.family,
					style: defaults.font.style,
					size: defaults.font.size,
				}));

				expect(tooltip.options).toEqual(jasmine.objectContaining({
					bodyAlign: 'left',
					bodySpacing: 2,
				}));

				expect(tooltip.options.titleFont).toEqual(jasmine.objectContaining({
					color: '#fff',
					family: defaults.font.family,
					style: 'bold',
					size: defaults.font.size,
				}));

				expect(tooltip.options).toEqual(jasmine.objectContaining({
					titleAlign: 'left',
					titleSpacing: 2,
					titleMarginBottom: 6,
				}));

				expect(tooltip.options.footerFont).toEqual(jasmine.objectContaining({
					color: '#fff',
					family: defaults.font.family,
					style: 'bold',
					size: defaults.font.size,
				}));

				expect(tooltip.options).toEqual(jasmine.objectContaining({
					footerAlign: 'left',
					footerSpacing: 2,
					footerMarginTop: 6,
				}));

				expect(tooltip.options).toEqual(jasmine.objectContaining({
					// Appearance
					caretSize: 5,
					caretPadding: 2,
					cornerRadius: 6,
					backgroundColor: 'rgba(0,0,0,0.8)',
					multiKeyBackground: '#fff',
					displayColors: true
				}));

				expect(tooltip).toEqual(jasmine.objectContaining({
					opacity: 1,

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
					labelColors: [{
						borderColor: defaults.color,
						backgroundColor: defaults.color
					}, {
						borderColor: defaults.color,
						backgroundColor: defaults.color
					}]
				}));

				expect(tooltip.x).toBeCloseToPixel(267);
				expect(tooltip.y).toBeCloseToPixel(155);

				done();
			});
			jasmine.triggerMouseEvent(chart, 'mousemove', {x: point.x, y: chart.chartArea.top + 10});
		});

		it('Should only display if intersecting if intersect is set', function(done) {
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

			afterEvent(chart, 'mousemove', function() {
				// Check and see if tooltip was displayed
				var tooltip = chart.tooltip;

				expect(tooltip).toEqual(jasmine.objectContaining({
					opacity: 0,
				}));

				done();
			});
			jasmine.triggerMouseEvent(chart, 'mousemove', {x: point.x, y: 0});
		});
	});

	it('Should display in single mode', function(done) {
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
					intersect: true
				}
			}
		});

		// Trigger an event over top of the
		var meta = chart.getDatasetMeta(0);
		var point = meta.data[1];

		afterEvent(chart, 'mousemove', function() {
			// Check and see if tooltip was displayed
			var tooltip = chart.tooltip;
			var defaults = Chart.defaults;

			expect(tooltip.options.xPadding).toEqual(6);
			expect(tooltip.options.yPadding).toEqual(6);
			expect(tooltip.xAlign).toEqual('left');
			expect(tooltip.yAlign).toEqual('center');

			expect(tooltip.options.bodyFont).toEqual(jasmine.objectContaining({
				color: '#fff',
				family: defaults.font.family,
				style: defaults.font.style,
				size: defaults.font.size,
			}));

			expect(tooltip.options).toEqual(jasmine.objectContaining({
				bodyAlign: 'left',
				bodySpacing: 2,
			}));

			expect(tooltip.options.titleFont).toEqual(jasmine.objectContaining({
				color: '#fff',
				family: defaults.font.family,
				style: 'bold',
				size: defaults.font.size,
			}));

			expect(tooltip.options).toEqual(jasmine.objectContaining({
				titleAlign: 'left',
				titleSpacing: 2,
				titleMarginBottom: 6,
			}));

			expect(tooltip.options.footerFont).toEqual(jasmine.objectContaining({
				color: '#fff',
				family: defaults.font.family,
				style: 'bold',
				size: defaults.font.size,
			}));

			expect(tooltip.options).toEqual(jasmine.objectContaining({
				footerAlign: 'left',
				footerSpacing: 2,
				footerMarginTop: 6,
			}));

			expect(tooltip.options).toEqual(jasmine.objectContaining({
				// Appearance
				caretSize: 5,
				caretPadding: 2,
				cornerRadius: 6,
				backgroundColor: 'rgba(0,0,0,0.8)',
				multiKeyBackground: '#fff',
				displayColors: true
			}));

			expect(tooltip.opacity).toEqual(1);
			expect(tooltip.title).toEqual(['Point 2']);
			expect(tooltip.beforeBody).toEqual([]);
			expect(tooltip.body).toEqual([{
				before: [],
				lines: ['Dataset 1: 20'],
				after: []
			}]);
			expect(tooltip.afterBody).toEqual([]);
			expect(tooltip.footer).toEqual([]);
			expect(tooltip.labelTextColors).toEqual(['#fff']);

			expect(tooltip.labelColors).toEqual([{
				borderColor: defaults.color,
				backgroundColor: defaults.color
			}]);

			expect(tooltip.x).toBeCloseToPixel(267);
			expect(tooltip.y).toBeCloseToPixel(312);

			done();
		});
		jasmine.triggerMouseEvent(chart, 'mousemove', point);
	});

	it('Should display information from user callbacks', function(done) {
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
						},
						labelPointStyle: function() {
							return {
								pointStyle: 'labelPointStyle',
								rotation: 42
							};
						}
					}
				}
			}
		});

		// Trigger an event over top of the
		var meta = chart.getDatasetMeta(0);
		var point = meta.data[1];

		afterEvent(chart, 'mousemove', function() {
			// Check and see if tooltip was displayed
			var tooltip = chart.tooltip;
			var defaults = Chart.defaults;

			expect(tooltip.options.xPadding).toEqual(6);
			expect(tooltip.options.yPadding).toEqual(6);
			expect(tooltip.xAlign).toEqual('left');
			expect(tooltip.yAlign).toEqual('center');

			expect(tooltip.options.bodyFont).toEqual(jasmine.objectContaining({
				color: '#fff',
				family: defaults.font.family,
				style: defaults.font.style,
				size: defaults.font.size,
			}));

			expect(tooltip.options).toEqual(jasmine.objectContaining({
				bodyAlign: 'left',
				bodySpacing: 2,
			}));

			expect(tooltip.options.titleFont).toEqual(jasmine.objectContaining({
				color: '#fff',
				family: defaults.font.family,
				style: 'bold',
				size: defaults.font.size,
			}));

			expect(tooltip.options).toEqual(jasmine.objectContaining({
				titleSpacing: 2,
				titleMarginBottom: 6,
			}));

			expect(tooltip.options.footerFont).toEqual(jasmine.objectContaining({
				color: '#fff',
				family: defaults.font.family,
				style: 'bold',
				size: defaults.font.size,
			}));

			expect(tooltip.options).toEqual(jasmine.objectContaining({
				footerAlign: 'left',
				footerSpacing: 2,
				footerMarginTop: 6,
			}));

			expect(tooltip.options).toEqual(jasmine.objectContaining({
				// Appearance
				caretSize: 5,
				caretPadding: 2,
				cornerRadius: 6,
				backgroundColor: 'rgba(0,0,0,0.8)',
				multiKeyBackground: '#fff',
			}));

			expect(tooltip).toEqual(jasmine.objectContaining({
				opacity: 1,

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
				labelTextColors: ['labelTextColor', 'labelTextColor'],
				labelColors: [{
					borderColor: defaults.color,
					backgroundColor: defaults.color
				}, {
					borderColor: defaults.color,
					backgroundColor: defaults.color
				}],
				labelPointStyles: [{
					pointStyle: 'labelPointStyle',
					rotation: 42
				}, {
					pointStyle: 'labelPointStyle',
					rotation: 42
				}]
			}));

			expect(tooltip.x).toBeCloseToPixel(267);
			expect(tooltip.y).toBeCloseToPixel(75);

			done();
		});
		jasmine.triggerMouseEvent(chart, 'mousemove', point);
	});


	it('Should provide context object to user callbacks', function(done) {
		const chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					label: 'Dataset 1',
					data: [{x: 1, y: 10}, {x: 2, y: 20}, {x: 3, y: 30}]
				}]
			},
			options: {
				scales: {
					x: {
						type: 'linear'
					}
				},
				tooltips: {
					mode: 'index',
					callbacks: {
						beforeLabel: function(ctx) {
							return ctx.dataPoint.x + ',' + ctx.dataPoint.y;
						}
					}
				}
			}
		});

		// Trigger an event over top of the
		const meta = chart.getDatasetMeta(0);
		const point = meta.data[1];

		afterEvent(chart, 'mousemove', function() {
			const tooltip = chart.tooltip;

			expect(tooltip.body[0].before).toEqual(['2,20']);

			done();
		});
		jasmine.triggerMouseEvent(chart, 'mousemove', point);
	});

	it('Should allow sorting items', function(done) {
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
					itemSort: function(a, b) {
						return a.datasetIndex > b.datasetIndex ? -1 : 1;
					}
				}
			}
		});

		// Trigger an event over top of the
		var meta0 = chart.getDatasetMeta(0);
		var point0 = meta0.data[1];

		afterEvent(chart, 'mousemove', function() {
			// Check and see if tooltip was displayed
			var tooltip = chart.tooltip;
			var defaults = Chart.defaults;

			expect(tooltip).toEqual(jasmine.objectContaining({
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
					borderColor: defaults.color,
					backgroundColor: defaults.color
				}, {
					borderColor: defaults.color,
					backgroundColor: defaults.color
				}]
			}));

			expect(tooltip.x).toBeCloseToPixel(267);
			expect(tooltip.y).toBeCloseToPixel(155);

			done();
		});
		jasmine.triggerMouseEvent(chart, 'mousemove', point0);

	});

	it('Should allow reversing items', function(done) {
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
					reverse: true
				}
			}
		});

		// Trigger an event over top of the
		var meta0 = chart.getDatasetMeta(0);
		var point0 = meta0.data[1];

		afterEvent(chart, 'mousemove', function() {
			// Check and see if tooltip was displayed
			var tooltip = chart.tooltip;
			var defaults = Chart.defaults;

			expect(tooltip).toEqual(jasmine.objectContaining({
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
					borderColor: defaults.color,
					backgroundColor: defaults.color
				}, {
					borderColor: defaults.color,
					backgroundColor: defaults.color
				}]
			}));

			expect(tooltip.x).toBeCloseToPixel(267);
			expect(tooltip.y).toBeCloseToPixel(155);

			done();
		});

		jasmine.triggerMouseEvent(chart, 'mousemove', point0);
	});

	it('Should follow dataset order', function(done) {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					label: 'Dataset 1',
					data: [10, 20, 30],
					pointHoverBorderColor: 'rgb(255, 0, 0)',
					pointHoverBackgroundColor: 'rgb(0, 255, 0)',
					order: 10
				}, {
					label: 'Dataset 2',
					data: [40, 40, 40],
					pointHoverBorderColor: 'rgb(0, 0, 255)',
					pointHoverBackgroundColor: 'rgb(0, 255, 255)',
					order: 5
				}],
				labels: ['Point 1', 'Point 2', 'Point 3']
			},
			options: {
				tooltips: {
					mode: 'index'
				}
			}
		});

		// Trigger an event over top of the
		var meta0 = chart.getDatasetMeta(0);
		var point0 = meta0.data[1];

		afterEvent(chart, 'mousemove', function() {
			// Check and see if tooltip was displayed
			var tooltip = chart.tooltip;
			var defaults = Chart.defaults;

			expect(tooltip).toEqual(jasmine.objectContaining({
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
					borderColor: defaults.color,
					backgroundColor: defaults.color
				}, {
					borderColor: defaults.color,
					backgroundColor: defaults.color
				}]
			}));

			expect(tooltip.x).toBeCloseToPixel(267);
			expect(tooltip.y).toBeCloseToPixel(155);

			done();
		});

		jasmine.triggerMouseEvent(chart, 'mousemove', point0);
	});

	it('should filter items from the tooltip using the callback', function(done) {
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
					mode: 'index',
					filter: function(tooltipItem, index, tooltipItems, data) {
						// For testing purposes remove the first dataset that has a tooltipHidden property
						return !data.datasets[tooltipItem.datasetIndex].tooltipHidden;
					}
				}
			}
		});

		// Trigger an event over top of the
		var meta0 = chart.getDatasetMeta(0);
		var point0 = meta0.data[1];

		afterEvent(chart, 'mousemove', function() {
			// Check and see if tooltip was displayed
			var tooltip = chart.tooltip;
			var defaults = Chart.defaults;

			expect(tooltip).toEqual(jasmine.objectContaining({
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
					borderColor: defaults.color,
					backgroundColor: defaults.color
				}]
			}));

			done();
		});

		jasmine.triggerMouseEvent(chart, 'mousemove', point0);
	});

	it('should set the caretPadding based on a config setting', function(done) {
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

		afterEvent(chart, 'mousemove', function() {
			// Check and see if tooltip was displayed
			var tooltip = chart.tooltip;

			expect(tooltip.options).toEqual(jasmine.objectContaining({
				// Positioning
				caretPadding: 10,
			}));

			done();
		});

		jasmine.triggerMouseEvent(chart, 'mousemove', point0);
	});

	['line', 'bar'].forEach(function(type) {
		it('Should have dataPoints in a ' + type + ' chart', function(done) {
			var chart = window.acquireChart({
				type: type,
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
						intersect: true
					}
				}
			});

			// Trigger an event over top of the element
			var pointIndex = 1;
			var datasetIndex = 0;
			var point = chart.getDatasetMeta(datasetIndex).data[pointIndex];

			afterEvent(chart, 'mousemove', function() {
				// Check and see if tooltip was displayed
				var tooltip = chart.tooltip;

				expect(tooltip instanceof Object).toBe(true);
				expect(tooltip.dataPoints instanceof Array).toBe(true);
				expect(tooltip.dataPoints.length).toBe(1);

				var tooltipItem = tooltip.dataPoints[0];

				expect(tooltipItem.dataIndex).toBe(pointIndex);
				expect(tooltipItem.datasetIndex).toBe(datasetIndex);
				expect(typeof tooltipItem.label).toBe('string');
				expect(tooltipItem.label).toBe(chart.data.labels[pointIndex]);
				expect(typeof tooltipItem.formattedValue).toBe('string');
				expect(tooltipItem.formattedValue).toBe('' + chart.data.datasets[datasetIndex].data[pointIndex]);

				done();
			});

			jasmine.triggerMouseEvent(chart, 'mousemove', point);
		});
	});

	it('Should not update if active element has not changed', function(done) {
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
					intersect: true,
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

		var tooltip = chart.tooltip;
		spyOn(tooltip, 'update').and.callThrough();

		afterEvent(chart, 'mousemove', function() {
			expect(tooltip.update).toHaveBeenCalledWith(true);

			// Reset calls
			tooltip.update.calls.reset();

			afterEvent(chart, 'mousemove', function() {
				expect(tooltip.update).not.toHaveBeenCalled();

				done();
			});
			// Second dispatch change event (same event), should not update tooltip
			jasmine.triggerMouseEvent(chart, 'mousemove', firstPoint);
		});
		// First dispatch change event, should update tooltip
		jasmine.triggerMouseEvent(chart, 'mousemove', firstPoint);
	});

	it('Should update if active elements are the same, but the position has changed', function(done) {
		const chart = window.acquireChart({
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
				scales: {
					x: {
						stacked: true,
					},
					y: {
						stacked: true
					}
				},
				tooltips: {
					mode: 'nearest',
					position: 'nearest',
					intersect: true,
					callbacks: {
						title: function() {
							return 'registering callback...';
						}
					}
				}
			}
		});

		// Trigger an event over top of the
		const meta = chart.getDatasetMeta(0);
		const firstPoint = meta.data[1];

		const meta2 = chart.getDatasetMeta(1);
		const secondPoint = meta2.data[1];

		const tooltip = chart.tooltip;
		spyOn(tooltip, 'update');

		afterEvent(chart, 'mousemove', function() {
			expect(tooltip.update).toHaveBeenCalledWith(true);

			// Reset calls
			tooltip.update.calls.reset();

			afterEvent(chart, 'mousemove', function() {
				expect(tooltip.update).toHaveBeenCalledWith(true);

				done();
			});
			// Second dispatch change event (same event), should update tooltip
			// because position mode is 'nearest'
			jasmine.triggerMouseEvent(chart, 'mousemove', secondPoint);
		});
		// First dispatch change event, should update tooltip
		jasmine.triggerMouseEvent(chart, 'mousemove', firstPoint);
	});

	describe('positioners', function() {
		it('Should call custom positioner with correct parameters and scope', function(done) {

			tooltipPlugin.positioners.test = function() {
				return {x: 0, y: 0};
			};

			spyOn(tooltipPlugin.positioners, 'test').and.callThrough();

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
			var fn = tooltipPlugin.positioners.test;

			afterEvent(chart, 'mousemove', function() {
				expect(fn.calls.count()).toBe(2);
				expect(fn.calls.first().args[0] instanceof Array).toBe(true);
				expect(Object.prototype.hasOwnProperty.call(fn.calls.first().args[1], 'x')).toBe(true);
				expect(Object.prototype.hasOwnProperty.call(fn.calls.first().args[1], 'y')).toBe(true);
				expect(fn.calls.first().object instanceof Tooltip).toBe(true);

				done();
			});
			jasmine.triggerMouseEvent(chart, 'mousemove', point);
		});
	});

	it('Should avoid tooltip truncation in x axis if there is enough space to show tooltip without truncation', function(done) {
		var chart = window.acquireChart({
			type: 'pie',
			data: {
				datasets: [{
					data: [
						50,
						50
					],
					backgroundColor: [
						'rgb(255, 0, 0)',
						'rgb(0, 255, 0)'
					],
					label: 'Dataset 1'
				}],
				labels: [
					'Red long tooltip text to avoid unnecessary loop steps',
					'Green long tooltip text to avoid unnecessary loop steps'
				]
			},
			options: {
				responsive: true,
				animation: {
					// without this slice center point is calculated wrong
					animateRotate: false
				},
				tooltips: {
					animation: false
				}
			}
		});

		function testSlice(slice, count) {
			var meta = chart.getDatasetMeta(0);
			var point = meta.data[slice].getCenterPoint();
			var tooltipPosition = meta.data[slice].tooltipPosition();

			function recursive(left) {
				chart.config.data.labels[slice] = chart.config.data.labels[slice] + 'XX';
				chart.update();

				afterEvent(chart, 'mouseout', function() {
					afterEvent(chart, 'mousemove', function() {
						var tooltip = chart.tooltip;
						expect(tooltip.dataPoints.length).toBe(1);
						expect(tooltip.x).toBeGreaterThanOrEqual(0);
						if (tooltip.width <= chart.width) {
							expect(tooltip.x + tooltip.width).toBeLessThanOrEqual(chart.width);
						}
						expect(tooltip.caretX).toBeCloseToPixel(tooltipPosition.x);
						// if tooltip is longer than chart area then all tests done
						if (tooltip.width > chart.width || left === 0) {
							done(left === 0 && new Error('max iterations reached'));
						} else {
							recursive(left - 1);
						}
					});
					jasmine.triggerMouseEvent(chart, 'mousemove', point);
				});

				jasmine.triggerMouseEvent(chart, 'mouseout', point);
			}

			recursive(count);
		}

		// Trigger an event over top of the slice
		for (var slice = 0; slice < 2; slice++) {
			testSlice(slice, 20);
		}
	});

	it('Should split newlines into separate lines in user callbacks', function(done) {
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
					callbacks: {
						beforeTitle: function() {
							return 'beforeTitle\nnewline';
						},
						title: function() {
							return 'title\nnewline';
						},
						afterTitle: function() {
							return 'afterTitle\nnewline';
						},
						beforeBody: function() {
							return 'beforeBody\nnewline';
						},
						beforeLabel: function() {
							return 'beforeLabel\nnewline';
						},
						label: function() {
							return 'label';
						},
						afterLabel: function() {
							return 'afterLabel\nnewline';
						},
						afterBody: function() {
							return 'afterBody\nnewline';
						},
						beforeFooter: function() {
							return 'beforeFooter\nnewline';
						},
						footer: function() {
							return 'footer\nnewline';
						},
						afterFooter: function() {
							return 'afterFooter\nnewline';
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

		afterEvent(chart, 'mousemove', function() {
			// Check and see if tooltip was displayed
			var tooltip = chart.tooltip;
			var defaults = Chart.defaults;

			expect(tooltip.options.xPadding).toEqual(6);
			expect(tooltip.options.yPadding).toEqual(6);
			expect(tooltip.xAlign).toEqual('center');
			expect(tooltip.yAlign).toEqual('top');

			expect(tooltip.options.bodyFont).toEqual(jasmine.objectContaining({
				color: '#fff',
				family: defaults.font.family,
				style: defaults.font.style,
				size: defaults.font.size,
			}));

			expect(tooltip.options).toEqual(jasmine.objectContaining({
				bodyAlign: 'left',
				bodySpacing: 2,
			}));

			expect(tooltip.options.titleFont).toEqual(jasmine.objectContaining({
				color: '#fff',
				family: defaults.font.family,
				style: 'bold',
				size: defaults.font.size,
			}));

			expect(tooltip.options).toEqual(jasmine.objectContaining({
				titleAlign: 'left',
				titleSpacing: 2,
				titleMarginBottom: 6,
			}));

			expect(tooltip.options.footerFont).toEqual(jasmine.objectContaining({
				color: '#fff',
				family: defaults.font.family,
				style: 'bold',
				size: defaults.font.size,
			}));

			expect(tooltip.options).toEqual(jasmine.objectContaining({
				footerAlign: 'left',
				footerSpacing: 2,
				footerMarginTop: 6,
			}));

			expect(tooltip.options).toEqual(jasmine.objectContaining({
				// Appearance
				caretSize: 5,
				caretPadding: 2,
				cornerRadius: 6,
				backgroundColor: 'rgba(0,0,0,0.8)',
				multiKeyBackground: '#fff',
			}));

			expect(tooltip).toEqual(jasmine.objectContaining({
				opacity: 1,

				// Text
				title: ['beforeTitle', 'newline', 'title', 'newline', 'afterTitle', 'newline'],
				beforeBody: ['beforeBody', 'newline'],
				body: [{
					before: ['beforeLabel', 'newline'],
					lines: ['label'],
					after: ['afterLabel', 'newline']
				}, {
					before: ['beforeLabel', 'newline'],
					lines: ['label'],
					after: ['afterLabel', 'newline']
				}],
				afterBody: ['afterBody', 'newline'],
				footer: ['beforeFooter', 'newline', 'footer', 'newline', 'afterFooter', 'newline'],
				labelTextColors: ['labelTextColor', 'labelTextColor'],
				labelColors: [{
					borderColor: defaults.color,
					backgroundColor: defaults.color
				}, {
					borderColor: defaults.color,
					backgroundColor: defaults.color
				}]
			}));

			done();
		});

		jasmine.triggerMouseEvent(chart, 'mousemove', point);
	});

	describe('text align', function() {
		var defaults = Chart.defaults;
		var makeView = function(title, body, footer) {
			return {
				// Positioning
				x: 100,
				y: 100,
				width: 100,
				height: 100,
				xAlign: 'left',
				yAlign: 'top',

				options: {
					xPadding: 5,
					yPadding: 5,

					// Body
					bodyFont: {
						color: '#fff',
						family: defaults.font.family,
						style: defaults.font.style,
						size: defaults.font.size,
					},
					bodyAlign: body,
					bodySpacing: 2,

					// Title
					titleFont: {
						color: '#fff',
						family: defaults.font.family,
						style: 'bold',
						size: defaults.font.size,
					},
					titleAlign: title,
					titleSpacing: 2,
					titleMarginBottom: 6,

					// Footer
					footerFont: {
						color: '#fff',
						family: defaults.font.family,
						style: 'bold',
						size: defaults.font.size,
					},
					footerAlign: footer,
					footerSpacing: 2,
					footerMarginTop: 6,

					// Appearance
					caretSize: 5,
					cornerRadius: 6,
					caretPadding: 2,
					borderColor: '#aaa',
					borderWidth: 1,
					backgroundColor: 'rgba(0,0,0,0.8)',
					multiKeyBackground: '#fff',
					displayColors: false

				},
				opacity: 1,

				// Text
				title: ['title'],
				beforeBody: [],
				body: [{
					before: [],
					lines: ['label'],
					after: []
				}],
				afterBody: [],
				footer: ['footer'],
				labelTextColors: ['#fff'],
				labelColors: [{
					borderColor: 'rgb(255, 0, 0)',
					backgroundColor: 'rgb(0, 255, 0)'
				}, {
					borderColor: 'rgb(0, 0, 255)',
					backgroundColor: 'rgb(0, 255, 255)'
				}]
			};
		};
		var drawBody = [
			{name: 'save', args: []},
			{name: 'setFillStyle', args: ['rgba(0,0,0,0.8)']},
			{name: 'setStrokeStyle', args: ['#aaa']},
			{name: 'setLineWidth', args: [1]},
			{name: 'beginPath', args: []},
			{name: 'moveTo', args: [106, 100]},
			{name: 'lineTo', args: [106, 100]},
			{name: 'lineTo', args: [111, 95]},
			{name: 'lineTo', args: [116, 100]},
			{name: 'lineTo', args: [194, 100]},
			{name: 'quadraticCurveTo', args: [200, 100, 200, 106]},
			{name: 'lineTo', args: [200, 194]},
			{name: 'quadraticCurveTo', args: [200, 200, 194, 200]},
			{name: 'lineTo', args: [106, 200]},
			{name: 'quadraticCurveTo', args: [100, 200, 100, 194]},
			{name: 'lineTo', args: [100, 106]},
			{name: 'quadraticCurveTo', args: [100, 100, 106, 100]},
			{name: 'closePath', args: []},
			{name: 'fill', args: []},
			{name: 'stroke', args: []}
		];

		var mockContext = window.createMockContext();
		var tooltip = new Tooltip({
			_chart: {
				options: {
					tooltips: {
						animation: false,
					}
				}
			}
		});

		it('Should go left', function() {
			mockContext.resetCalls();
			Chart.helpers.merge(tooltip, makeView('left', 'left', 'left'));
			tooltip.draw(mockContext);

			expect(mockContext.getCalls()).toEqual(Array.prototype.concat(drawBody, [
				{name: 'setTextAlign', args: ['left']},
				{name: 'setFillStyle', args: ['#fff']},
				{name: 'fillText', args: ['title', 105, 111]},
				{name: 'setTextAlign', args: ['left']},
				{name: 'setFillStyle', args: ['#fff']},
				{name: 'setFillStyle', args: ['#fff']},
				{name: 'fillText', args: ['label', 105, 129]},
				{name: 'setTextAlign', args: ['left']},
				{name: 'setFillStyle', args: ['#fff']},
				{name: 'fillText', args: ['footer', 105, 147]},
				{name: 'restore', args: []}
			]));
		});

		it('Should go right', function() {
			mockContext.resetCalls();
			Chart.helpers.merge(tooltip, makeView('right', 'right', 'right'));
			tooltip.draw(mockContext);

			expect(mockContext.getCalls()).toEqual(Array.prototype.concat(drawBody, [
				{name: 'setTextAlign', args: ['right']},
				{name: 'setFillStyle', args: ['#fff']},
				{name: 'fillText', args: ['title', 195, 111]},
				{name: 'setTextAlign', args: ['right']},
				{name: 'setFillStyle', args: ['#fff']},
				{name: 'setFillStyle', args: ['#fff']},
				{name: 'fillText', args: ['label', 195, 129]},
				{name: 'setTextAlign', args: ['right']},
				{name: 'setFillStyle', args: ['#fff']},
				{name: 'fillText', args: ['footer', 195, 147]},
				{name: 'restore', args: []}
			]));
		});

		it('Should center', function() {
			mockContext.resetCalls();
			Chart.helpers.merge(tooltip, makeView('center', 'center', 'center'));
			tooltip.draw(mockContext);

			expect(mockContext.getCalls()).toEqual(Array.prototype.concat(drawBody, [
				{name: 'setTextAlign', args: ['center']},
				{name: 'setFillStyle', args: ['#fff']},
				{name: 'fillText', args: ['title', 150, 111]},
				{name: 'setTextAlign', args: ['center']},
				{name: 'setFillStyle', args: ['#fff']},
				{name: 'setFillStyle', args: ['#fff']},
				{name: 'fillText', args: ['label', 150, 129]},
				{name: 'setTextAlign', args: ['center']},
				{name: 'setFillStyle', args: ['#fff']},
				{name: 'fillText', args: ['footer', 150, 147]},
				{name: 'restore', args: []}
			]));
		});

		it('Should allow mixed', function() {
			mockContext.resetCalls();
			Chart.helpers.merge(tooltip, makeView('right', 'center', 'left'));
			tooltip.draw(mockContext);

			expect(mockContext.getCalls()).toEqual(Array.prototype.concat(drawBody, [
				{name: 'setTextAlign', args: ['right']},
				{name: 'setFillStyle', args: ['#fff']},
				{name: 'fillText', args: ['title', 195, 111]},
				{name: 'setTextAlign', args: ['center']},
				{name: 'setFillStyle', args: ['#fff']},
				{name: 'setFillStyle', args: ['#fff']},
				{name: 'fillText', args: ['label', 150, 129]},
				{name: 'setTextAlign', args: ['left']},
				{name: 'setFillStyle', args: ['#fff']},
				{name: 'fillText', args: ['footer', 105, 147]},
				{name: 'restore', args: []}
			]));
		});
	});

	describe('active events', function() {
		it('should set the active events', function() {
			var chart = window.acquireChart({
				type: 'line',
				data: {
					datasets: [{
						label: 'Dataset 1',
						data: [10, 20, 30],
						pointHoverBorderColor: 'rgb(255, 0, 0)',
						pointHoverBackgroundColor: 'rgb(0, 255, 0)'
					}],
					labels: ['Point 1', 'Point 2', 'Point 3']
				},
			});

			const meta = chart.getDatasetMeta(0);
			chart.tooltip.setActiveElements([{datasetIndex: 0, index: 0}], {x: 0, y: 0});
			expect(chart.tooltip.getActiveElements()[0].element).toBe(meta.data[0]);
		});
	});
});

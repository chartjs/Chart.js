describe('Chart.controllers.bar', function() {
	describe('auto', jasmine.specsFromFixtures('controller.bar'));

	it('should be constructed', function() {
		var chart = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [
					{data: []},
					{data: []}
				],
				labels: []
			}
		});

		var meta = chart.getDatasetMeta(1);
		expect(meta.type).toEqual('bar');
		expect(meta.data).toEqual([]);
		expect(meta.hidden).toBe(null);
		expect(meta.controller).not.toBe(undefined);
		expect(meta.controller.index).toBe(1);
		expect(meta.xAxisID).not.toBe(null);
		expect(meta.yAxisID).not.toBe(null);

		meta.controller.updateIndex(0);
		expect(meta.controller.index).toBe(0);
	});

	it('should use the first scale IDs if the dataset does not specify them', function() {
		var chart = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [
					{data: []},
					{data: []}
				],
				labels: []
			},
			options: {
				scales: {
					xAxes: [{
						id: 'firstXScaleID'
					}],
					yAxes: [{
						id: 'firstYScaleID'
					}]
				}
			}
		});

		var meta = chart.getDatasetMeta(1);
		expect(meta.xAxisID).toBe('firstXScaleID');
		expect(meta.yAxisID).toBe('firstYScaleID');
	});

	it('should correctly count the number of stacks ignoring datasets of other types and hidden datasets', function() {
		[
			'bar',
			'horizontalBar'
		].forEach(function(barType) {
			var chart = window.acquireChart({
				type: barType,
				data: {
					datasets: [
						{data: [], type: 'line'},
						{data: [], hidden: true},
						{data: []},
						{data: []}
					],
					labels: []
				}
			});

			var meta = chart.getDatasetMeta(1);
			expect(meta.controller.getStackCount()).toBe(2);
		});
	});

	it('should correctly count the number of stacks when a group is not specified', function() {
		[
			'bar',
			'horizontalBar'
		].forEach(function(barType) {
			var chart = window.acquireChart({
				type: barType,
				data: {
					datasets: [
						{data: []},
						{data: []},
						{data: []},
						{data: []}
					],
					labels: []
				}
			});

			var meta = chart.getDatasetMeta(1);
			expect(meta.controller.getStackCount()).toBe(4);
		});
	});

	it('should correctly count the number of stacks when a group is not specified and the scale is stacked', function() {
		[
			'bar',
			'horizontalBar'
		].forEach(function(barType) {
			var chart = window.acquireChart({
				type: barType,
				data: {
					datasets: [
						{data: []},
						{data: []},
						{data: []},
						{data: []}
					],
					labels: []
				},
				options: {
					scales: {
						xAxes: [{
							stacked: true
						}],
						yAxes: [{
							stacked: true
						}]
					}
				}
			});

			var meta = chart.getDatasetMeta(1);
			expect(meta.controller.getStackCount()).toBe(1);
		});
	});

	it('should correctly count the number of stacks when a group is not specified and the scale is not stacked', function() {
		[
			'bar',
			'horizontalBar'
		].forEach(function(barType) {
			var chart = window.acquireChart({
				type: barType,
				data: {
					datasets: [
						{data: []},
						{data: []},
						{data: []},
						{data: []}
					],
					labels: []
				},
				options: {
					scales: {
						xAxes: [{
							stacked: false
						}],
						yAxes: [{
							stacked: false
						}]
					}
				}
			});

			var meta = chart.getDatasetMeta(1);
			expect(meta.controller.getStackCount()).toBe(4);
		});
	});

	it('should correctly count the number of stacks when a group is specified for some', function() {
		[
			'bar',
			'horizontalBar'
		].forEach(function(barType) {
			var chart = window.acquireChart({
				type: barType,
				data: {
					datasets: [
						{data: [], stack: 'stack1'},
						{data: [], stack: 'stack1'},
						{data: []},
						{data: []}
					],
					labels: []
				}
			});

			var meta = chart.getDatasetMeta(3);
			expect(meta.controller.getStackCount()).toBe(3);
		});
	});

	it('should correctly count the number of stacks when a group is specified for some and the scale is stacked', function() {
		[
			'bar',
			'horizontalBar'
		].forEach(function(barType) {
			var chart = window.acquireChart({
				type: barType,
				data: {
					datasets: [
						{data: [], stack: 'stack1'},
						{data: [], stack: 'stack1'},
						{data: []},
						{data: []}
					],
					labels: []
				},
				options: {
					scales: {
						xAxes: [{
							stacked: true
						}],
						yAxes: [{
							stacked: true
						}]
					}
				}
			});

			var meta = chart.getDatasetMeta(3);
			expect(meta.controller.getStackCount()).toBe(2);
		});
	});

	it('should correctly count the number of stacks when a group is specified for some and the scale is not stacked', function() {
		[
			'bar',
			'horizontalBar'
		].forEach(function(barType) {
			var chart = window.acquireChart({
				type: barType,
				data: {
					datasets: [
						{data: [], stack: 'stack1'},
						{data: [], stack: 'stack1'},
						{data: []},
						{data: []}
					],
					labels: []
				},
				options: {
					scales: {
						xAxes: [{
							stacked: false
						}],
						yAxes: [{
							stacked: false
						}]
					}
				}
			});

			var meta = chart.getDatasetMeta(3);
			expect(meta.controller.getStackCount()).toBe(4);
		});
	});

	it('should correctly count the number of stacks when a group is specified for all', function() {
		[
			'bar',
			'horizontalBar'
		].forEach(function(barType) {
			var chart = window.acquireChart({
				type: barType,
				data: {
					datasets: [
						{data: [], stack: 'stack1'},
						{data: [], stack: 'stack1'},
						{data: [], stack: 'stack2'},
						{data: [], stack: 'stack2'}
					],
					labels: []
				}
			});

			var meta = chart.getDatasetMeta(3);
			expect(meta.controller.getStackCount()).toBe(2);
		});
	});

	it('should correctly count the number of stacks when a group is specified for all and the scale is stacked', function() {
		[
			'bar',
			'horizontalBar'
		].forEach(function(barType) {
			var chart = window.acquireChart({
				type: barType,
				data: {
					datasets: [
						{data: [], stack: 'stack1'},
						{data: [], stack: 'stack1'},
						{data: [], stack: 'stack2'},
						{data: [], stack: 'stack2'}
					],
					labels: []
				},
				options: {
					scales: {
						xAxes: [{
							stacked: true
						}],
						yAxes: [{
							stacked: true
						}]
					}
				}
			});

			var meta = chart.getDatasetMeta(3);
			expect(meta.controller.getStackCount()).toBe(2);
		});
	});

	it('should correctly count the number of stacks when a group is specified for all and the scale is not stacked', function() {
		[
			'bar',
			'horizontalBar'
		].forEach(function(barType) {
			var chart = window.acquireChart({
				type: barType,
				data: {
					datasets: [
						{data: [], stack: 'stack1'},
						{data: [], stack: 'stack1'},
						{data: [], stack: 'stack2'},
						{data: [], stack: 'stack2'}
					],
					labels: []
				},
				options: {
					scales: {
						xAxes: [{
							stacked: false
						}],
						yAxes: [{
							stacked: false
						}]
					}
				}
			});

			var meta = chart.getDatasetMeta(3);
			expect(meta.controller.getStackCount()).toBe(4);
		});
	});

	it('should correctly get the stack index accounting for datasets of other types and hidden datasets', function() {
		[
			'bar',
			'horizontalBar'
		].forEach(function(barType) {
			var chart = window.acquireChart({
				type: barType,
				data: {
					datasets: [
						{data: []},
						{data: [], hidden: true},
						{data: [], type: 'line'},
						{data: []}
					],
					labels: []
				}
			});

			var meta = chart.getDatasetMeta(1);
			expect(meta.controller.getStackIndex(0)).toBe(0);
			expect(meta.controller.getStackIndex(3)).toBe(1);
		});
	});

	it('should correctly get the stack index when a group is not specified', function() {
		[
			'bar',
			'horizontalBar'
		].forEach(function(barType) {
			var chart = window.acquireChart({
				type: barType,
				data: {
					datasets: [
						{data: []},
						{data: []},
						{data: []},
						{data: []}
					],
					labels: []
				}
			});

			var meta = chart.getDatasetMeta(1);
			expect(meta.controller.getStackIndex(0)).toBe(0);
			expect(meta.controller.getStackIndex(1)).toBe(1);
			expect(meta.controller.getStackIndex(2)).toBe(2);
			expect(meta.controller.getStackIndex(3)).toBe(3);
		});
	});

	it('should correctly get the stack index when a group is not specified and the scale is stacked', function() {
		[
			'bar',
			'horizontalBar'
		].forEach(function(barType) {
			var chart = window.acquireChart({
				type: barType,
				data: {
					datasets: [
						{data: []},
						{data: []},
						{data: []},
						{data: []}
					],
					labels: []
				},
				options: {
					scales: {
						xAxes: [{
							stacked: true
						}],
						yAxes: [{
							stacked: true
						}]
					}
				}
			});

			var meta = chart.getDatasetMeta(1);
			expect(meta.controller.getStackIndex(0)).toBe(0);
			expect(meta.controller.getStackIndex(1)).toBe(0);
			expect(meta.controller.getStackIndex(2)).toBe(0);
			expect(meta.controller.getStackIndex(3)).toBe(0);
		});
	});

	it('should correctly get the stack index when a group is not specified and the scale is not stacked', function() {
		[
			'bar',
			'horizontalBar'
		].forEach(function(barType) {
			var chart = window.acquireChart({
				type: barType,
				data: {
					datasets: [
						{data: []},
						{data: []},
						{data: []},
						{data: []}
					],
					labels: []
				},
				options: {
					scales: {
						xAxes: [{
							stacked: false
						}],
						yAxes: [{
							stacked: false
						}]
					}
				}
			});

			var meta = chart.getDatasetMeta(1);
			expect(meta.controller.getStackIndex(0)).toBe(0);
			expect(meta.controller.getStackIndex(1)).toBe(1);
			expect(meta.controller.getStackIndex(2)).toBe(2);
			expect(meta.controller.getStackIndex(3)).toBe(3);
		});
	});

	it('should correctly get the stack index when a group is specified for some', function() {
		[
			'bar',
			'horizontalBar'
		].forEach(function(barType) {
			var chart = window.acquireChart({
				type: barType,
				data: {
					datasets: [
						{data: [], stack: 'stack1'},
						{data: [], stack: 'stack1'},
						{data: []},
						{data: []}
					],
					labels: []
				}
			});

			var meta = chart.getDatasetMeta(1);
			expect(meta.controller.getStackIndex(0)).toBe(0);
			expect(meta.controller.getStackIndex(1)).toBe(0);
			expect(meta.controller.getStackIndex(2)).toBe(1);
			expect(meta.controller.getStackIndex(3)).toBe(2);
		});
	});

	it('should correctly get the stack index when a group is specified for some and the scale is stacked', function() {
		[
			'bar',
			'horizontalBar'
		].forEach(function(barType) {
			var chart = window.acquireChart({
				type: barType,
				data: {
					datasets: [
						{data: [], stack: 'stack1'},
						{data: [], stack: 'stack1'},
						{data: []},
						{data: []}
					],
					labels: []
				},
				options: {
					scales: {
						xAxes: [{
							stacked: true
						}],
						yAxes: [{
							stacked: true
						}]
					}
				}
			});

			var meta = chart.getDatasetMeta(1);
			expect(meta.controller.getStackIndex(0)).toBe(0);
			expect(meta.controller.getStackIndex(1)).toBe(0);
			expect(meta.controller.getStackIndex(2)).toBe(1);
			expect(meta.controller.getStackIndex(3)).toBe(1);
		});
	});

	it('should correctly get the stack index when a group is specified for some and the scale is not stacked', function() {
		[
			'bar',
			'horizontalBar'
		].forEach(function(barType) {
			var chart = window.acquireChart({
				type: barType,
				data: {
					datasets: [
						{data: [], stack: 'stack1'},
						{data: [], stack: 'stack1'},
						{data: []},
						{data: []}
					],
					labels: []
				},
				options: {
					scales: {
						xAxes: [{
							stacked: false
						}],
						yAxes: [{
							stacked: false
						}]
					}
				}
			});

			var meta = chart.getDatasetMeta(1);
			expect(meta.controller.getStackIndex(0)).toBe(0);
			expect(meta.controller.getStackIndex(1)).toBe(1);
			expect(meta.controller.getStackIndex(2)).toBe(2);
			expect(meta.controller.getStackIndex(3)).toBe(3);
		});
	});

	it('should correctly get the stack index when a group is specified for all', function() {
		[
			'bar',
			'horizontalBar'
		].forEach(function(barType) {
			var chart = window.acquireChart({
				type: barType,
				data: {
					datasets: [
						{data: [], stack: 'stack1'},
						{data: [], stack: 'stack1'},
						{data: [], stack: 'stack2'},
						{data: [], stack: 'stack2'}
					],
					labels: []
				}
			});

			var meta = chart.getDatasetMeta(1);
			expect(meta.controller.getStackIndex(0)).toBe(0);
			expect(meta.controller.getStackIndex(1)).toBe(0);
			expect(meta.controller.getStackIndex(2)).toBe(1);
			expect(meta.controller.getStackIndex(3)).toBe(1);
		});
	});

	it('should correctly get the stack index when a group is specified for all and the scale is stacked', function() {
		[
			'bar',
			'horizontalBar'
		].forEach(function(barType) {
			var chart = window.acquireChart({
				type: barType,
				data: {
					datasets: [
						{data: [], stack: 'stack1'},
						{data: [], stack: 'stack1'},
						{data: [], stack: 'stack2'},
						{data: [], stack: 'stack2'}
					],
					labels: []
				},
				options: {
					scales: {
						xAxes: [{
							stacked: true
						}],
						yAxes: [{
							stacked: true
						}]
					}
				}
			});

			var meta = chart.getDatasetMeta(1);
			expect(meta.controller.getStackIndex(0)).toBe(0);
			expect(meta.controller.getStackIndex(1)).toBe(0);
			expect(meta.controller.getStackIndex(2)).toBe(1);
			expect(meta.controller.getStackIndex(3)).toBe(1);
		});
	});

	it('should correctly get the stack index when a group is specified for all and the scale is not stacked', function() {
		[
			'bar',
			'horizontalBar'
		].forEach(function(barType) {
			var chart = window.acquireChart({
				type: barType,
				data: {
					datasets: [
						{data: [], stack: 'stack1'},
						{data: [], stack: 'stack1'},
						{data: [], stack: 'stack2'},
						{data: [], stack: 'stack2'}
					],
					labels: []
				},
				options: {
					scales: {
						xAxes: [{
							stacked: false
						}],
						yAxes: [{
							stacked: false
						}]
					}
				}
			});

			var meta = chart.getDatasetMeta(1);
			expect(meta.controller.getStackIndex(0)).toBe(0);
			expect(meta.controller.getStackIndex(1)).toBe(1);
			expect(meta.controller.getStackIndex(2)).toBe(2);
			expect(meta.controller.getStackIndex(3)).toBe(3);
		});
	});

	it('should create rectangle elements for each data item during initialization', function() {
		var chart = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [
					{data: []},
					{data: [10, 15, 0, -4]}
				],
				labels: []
			}
		});

		var meta = chart.getDatasetMeta(1);
		expect(meta.data.length).toBe(4); // 4 rectangles created
		expect(meta.data[0] instanceof Chart.elements.Rectangle).toBe(true);
		expect(meta.data[1] instanceof Chart.elements.Rectangle).toBe(true);
		expect(meta.data[2] instanceof Chart.elements.Rectangle).toBe(true);
		expect(meta.data[3] instanceof Chart.elements.Rectangle).toBe(true);
	});

	it('should update elements when modifying data', function() {
		var chart = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [{
					data: [1, 2],
					label: 'dataset1'
				}, {
					data: [10, 15, 0, -4],
					label: 'dataset2',
					borderColor: 'blue'
				}],
				labels: ['label1', 'label2', 'label3', 'label4']
			},
			options: {
				legend: false,
				title: false,
				elements: {
					rectangle: {
						backgroundColor: 'red',
						borderSkipped: 'top',
						borderColor: 'green',
						borderWidth: 2,
					}
				},
				scales: {
					xAxes: [{
						id: 'firstXScaleID',
						type: 'category',
						display: false
					}],
					yAxes: [{
						id: 'firstYScaleID',
						type: 'linear',
						display: false
					}]
				}
			}
		});

		var meta = chart.getDatasetMeta(1);
		expect(meta.data.length).toBe(4);

		chart.data.datasets[1].data = [1, 2]; // remove 2 items
		chart.data.datasets[1].borderWidth = 1;
		chart.update();

		expect(meta.data.length).toBe(2);

		[
			{x: 89, y: 512},
			{x: 217, y: 0}
		].forEach(function(expected, i) {
			expect(meta.data[i]._datasetIndex).toBe(1);
			expect(meta.data[i]._index).toBe(i);
			expect(meta.data[i]._xScale).toBe(chart.scales.firstXScaleID);
			expect(meta.data[i]._yScale).toBe(chart.scales.firstYScaleID);
			expect(meta.data[i]._model.x).toBeCloseToPixel(expected.x);
			expect(meta.data[i]._model.y).toBeCloseToPixel(expected.y);
			expect(meta.data[i]._model.base).toBeCloseToPixel(1024);
			expect(meta.data[i]._model.width).toBeCloseToPixel(46);
			expect(meta.data[i]._model).toEqual(jasmine.objectContaining({
				datasetLabel: chart.data.datasets[1].label,
				label: chart.data.labels[i],
				backgroundColor: 'red',
				borderSkipped: 'top',
				borderColor: 'blue',
				borderWidth: 1
			}));
		});

		chart.data.datasets[1].data = [1, 2, 3]; // add 1 items
		chart.update();

		expect(meta.data.length).toBe(3); // should add a new meta data item
	});

	it('should get the correct bar points when datasets of different types exist', function() {
		var chart = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [{
					data: [1, 2],
					label: 'dataset1'
				}, {
					type: 'line',
					data: [4, 6],
					label: 'dataset2'
				}, {
					data: [8, 10],
					label: 'dataset3'
				}],
				labels: ['label1', 'label2']
			},
			options: {
				legend: false,
				title: false,
				scales: {
					xAxes: [{
						type: 'category',
						display: false
					}],
					yAxes: [{
						type: 'linear',
						display: false
					}]
				}
			}
		});

		var meta = chart.getDatasetMeta(2);
		expect(meta.data.length).toBe(2);

		var bar1 = meta.data[0];
		var bar2 = meta.data[1];

		expect(bar1._model.x).toBeCloseToPixel(179);
		expect(bar1._model.y).toBeCloseToPixel(114);
		expect(bar2._model.x).toBeCloseToPixel(435);
		expect(bar2._model.y).toBeCloseToPixel(0);
	});

	it('should update elements when the scales are stacked', function() {
		var chart = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [{
					data: [10, -10, 10, -10],
					label: 'dataset1'
				}, {
					data: [10, 15, 0, -4],
					label: 'dataset2'
				}],
				labels: ['label1', 'label2', 'label3', 'label4']
			},
			options: {
				legend: false,
				title: false,
				scales: {
					xAxes: [{
						type: 'category',
						display: false
					}],
					yAxes: [{
						type: 'linear',
						display: false,
						stacked: true
					}]
				}
			}
		});

		var meta0 = chart.getDatasetMeta(0);

		[
			{b: 293, w: 92 / 2, x: 38, y: 146},
			{b: 293, w: 92 / 2, x: 166, y: 439},
			{b: 293, w: 92 / 2, x: 295, y: 146},
			{b: 293, w: 92 / 2, x: 422, y: 439}
		].forEach(function(values, i) {
			expect(meta0.data[i]._model.base).toBeCloseToPixel(values.b);
			expect(meta0.data[i]._model.width).toBeCloseToPixel(values.w);
			expect(meta0.data[i]._model.x).toBeCloseToPixel(values.x);
			expect(meta0.data[i]._model.y).toBeCloseToPixel(values.y);
		});

		var meta1 = chart.getDatasetMeta(1);

		[
			{b: 146, w: 92 / 2, x: 89, y: 0},
			{b: 293, w: 92 / 2, x: 217, y: 73},
			{b: 146, w: 92 / 2, x: 345, y: 146},
			{b: 439, w: 92 / 2, x: 473, y: 497}
		].forEach(function(values, i) {
			expect(meta1.data[i]._model.base).toBeCloseToPixel(values.b);
			expect(meta1.data[i]._model.width).toBeCloseToPixel(values.w);
			expect(meta1.data[i]._model.x).toBeCloseToPixel(values.x);
			expect(meta1.data[i]._model.y).toBeCloseToPixel(values.y);
		});
	});

	it('should update elements when the scales are stacked and the y axis has a user defined minimum', function() {
		var chart = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [{
					data: [50, 20, 10, 100],
					label: 'dataset1'
				}, {
					data: [50, 80, 90, 0],
					label: 'dataset2'
				}],
				labels: ['label1', 'label2', 'label3', 'label4']
			},
			options: {
				legend: false,
				title: false,
				scales: {
					xAxes: [{
						type: 'category',
						display: false
					}],
					yAxes: [{
						type: 'linear',
						display: false,
						stacked: true,
						ticks: {
							min: 50,
							max: 100
						}
					}]
				}
			}
		});

		var meta0 = chart.getDatasetMeta(0);

		[
			{b: 1024, w: 92 / 2, x: 38, y: 512},
			{b: 1024, w: 92 / 2, x: 166, y: 819},
			{b: 1024, w: 92 / 2, x: 294, y: 922},
			{b: 1024, w: 92 / 2, x: 422.5, y: 0}
		].forEach(function(values, i) {
			expect(meta0.data[i]._model.base).toBeCloseToPixel(values.b);
			expect(meta0.data[i]._model.width).toBeCloseToPixel(values.w);
			expect(meta0.data[i]._model.x).toBeCloseToPixel(values.x);
			expect(meta0.data[i]._model.y).toBeCloseToPixel(values.y);
		});

		var meta1 = chart.getDatasetMeta(1);

		[
			{b: 512, w: 92 / 2, x: 89, y: 0},
			{b: 819, w: 92 / 2, x: 217, y: 0},
			{b: 922, w: 92 / 2, x: 345, y: 0},
			{b: 0, w: 92 / 2, x: 473.5, y: 0}
		].forEach(function(values, i) {
			expect(meta1.data[i]._model.base).toBeCloseToPixel(values.b);
			expect(meta1.data[i]._model.width).toBeCloseToPixel(values.w);
			expect(meta1.data[i]._model.x).toBeCloseToPixel(values.x);
			expect(meta1.data[i]._model.y).toBeCloseToPixel(values.y);
		});
	});

	it('should update elements when only the category scale is stacked', function() {
		var chart = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [{
					data: [20, -10, 10, -10],
					label: 'dataset1'
				}, {
					data: [10, 15, 0, -14],
					label: 'dataset2'
				}],
				labels: ['label1', 'label2', 'label3', 'label4']
			},
			options: {
				legend: false,
				title: false,
				scales: {
					xAxes: [{
						type: 'category',
						display: false,
						stacked: true
					}],
					yAxes: [{
						type: 'linear',
						display: false
					}]
				}
			}
		});

		var meta0 = chart.getDatasetMeta(0);

		[
			{b: 293, w: 92, x: 64, y: 0},
			{b: 293, w: 92, x: 192, y: 439},
			{b: 293, w: 92, x: 320, y: 146},
			{b: 293, w: 92, x: 448, y: 439}
		].forEach(function(values, i) {
			expect(meta0.data[i]._model.base).toBeCloseToPixel(values.b);
			expect(meta0.data[i]._model.width).toBeCloseToPixel(values.w);
			expect(meta0.data[i]._model.x).toBeCloseToPixel(values.x);
			expect(meta0.data[i]._model.y).toBeCloseToPixel(values.y);
		});

		var meta1 = chart.getDatasetMeta(1);

		[
			{b: 293, w: 92, x: 64, y: 146},
			{b: 293, w: 92, x: 192, y: 73},
			{b: 293, w: 92, x: 320, y: 293},
			{b: 293, w: 92, x: 448, y: 497}
		].forEach(function(values, i) {
			expect(meta1.data[i]._model.base).toBeCloseToPixel(values.b);
			expect(meta1.data[i]._model.width).toBeCloseToPixel(values.w);
			expect(meta1.data[i]._model.x).toBeCloseToPixel(values.x);
			expect(meta1.data[i]._model.y).toBeCloseToPixel(values.y);
		});
	});

	it('should update elements when the scales are stacked and data is strings', function() {
		var chart = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [{
					data: ['10', '-10', '10', '-10'],
					label: 'dataset1'
				}, {
					data: ['10', '15', '0', '-4'],
					label: 'dataset2'
				}],
				labels: ['label1', 'label2', 'label3', 'label4']
			},
			options: {
				legend: false,
				title: false,
				scales: {
					xAxes: [{
						type: 'category',
						display: false
					}],
					yAxes: [{
						type: 'linear',
						display: false,
						stacked: true
					}]
				}
			}
		});

		var meta0 = chart.getDatasetMeta(0);

		[
			{b: 293, w: 92 / 2, x: 38, y: 146},
			{b: 293, w: 92 / 2, x: 166, y: 439},
			{b: 293, w: 92 / 2, x: 295, y: 146},
			{b: 293, w: 92 / 2, x: 422, y: 439}
		].forEach(function(values, i) {
			expect(meta0.data[i]._model.base).toBeCloseToPixel(values.b);
			expect(meta0.data[i]._model.width).toBeCloseToPixel(values.w);
			expect(meta0.data[i]._model.x).toBeCloseToPixel(values.x);
			expect(meta0.data[i]._model.y).toBeCloseToPixel(values.y);
		});

		var meta1 = chart.getDatasetMeta(1);

		[
			{b: 146, w: 92 / 2, x: 89, y: 0},
			{b: 293, w: 92 / 2, x: 217, y: 73},
			{b: 146, w: 92 / 2, x: 345, y: 146},
			{b: 439, w: 92 / 2, x: 473, y: 497}
		].forEach(function(values, i) {
			expect(meta1.data[i]._model.base).toBeCloseToPixel(values.b);
			expect(meta1.data[i]._model.width).toBeCloseToPixel(values.w);
			expect(meta1.data[i]._model.x).toBeCloseToPixel(values.x);
			expect(meta1.data[i]._model.y).toBeCloseToPixel(values.y);
		});
	});

	it('should get the correct bar points for grouped stacked chart if the group name is same', function() {
		var chart = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [{
					data: [10, -10, 10, -10],
					label: 'dataset1',
					stack: 'stack1'
				}, {
					data: [10, 15, 0, -4],
					label: 'dataset2',
					stack: 'stack1'
				}],
				labels: ['label1', 'label2', 'label3', 'label4']
			},
			options: {
				legend: false,
				title: false,
				scales: {
					xAxes: [{
						type: 'category',
						display: false
					}],
					yAxes: [{
						type: 'linear',
						display: false,
						stacked: true
					}]
				}
			}
		});

		var meta0 = chart.getDatasetMeta(0);

		[
			{b: 293, w: 92, x: 64, y: 146},
			{b: 293, w: 92, x: 192, y: 439},
			{b: 293, w: 92, x: 320, y: 146},
			{b: 293, w: 92, x: 448, y: 439}
		].forEach(function(values, i) {
			expect(meta0.data[i]._model.base).toBeCloseToPixel(values.b);
			expect(meta0.data[i]._model.width).toBeCloseToPixel(values.w);
			expect(meta0.data[i]._model.x).toBeCloseToPixel(values.x);
			expect(meta0.data[i]._model.y).toBeCloseToPixel(values.y);
		});

		var meta = chart.getDatasetMeta(1);

		[
			{b: 146, w: 92, x: 64, y: 0},
			{b: 293, w: 92, x: 192, y: 73},
			{b: 146, w: 92, x: 320, y: 146},
			{b: 439, w: 92, x: 448, y: 497}
		].forEach(function(values, i) {
			expect(meta.data[i]._model.base).toBeCloseToPixel(values.b);
			expect(meta.data[i]._model.width).toBeCloseToPixel(values.w);
			expect(meta.data[i]._model.x).toBeCloseToPixel(values.x);
			expect(meta.data[i]._model.y).toBeCloseToPixel(values.y);
		});
	});

	it('should get the correct bar points for grouped stacked chart if the group name is different', function() {
		var chart = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [{
					data: [1, 2],
					stack: 'stack1'
				}, {
					data: [1, 2],
					stack: 'stack2'
				}],
				labels: ['label1', 'label2', 'label3', 'label4']
			},
			options: {
				legend: false,
				title: false,
				scales: {
					xAxes: [{
						type: 'category',
						display: false
					}],
					yAxes: [{
						type: 'linear',
						display: false,
						stacked: true,
					}]
				}
			}
		});

		var meta = chart.getDatasetMeta(1);

		[
			{x: 89, y: 256},
			{x: 217, y: 0}
		].forEach(function(values, i) {
			expect(meta.data[i]._model.base).toBeCloseToPixel(512);
			expect(meta.data[i]._model.width).toBeCloseToPixel(46);
			expect(meta.data[i]._model.x).toBeCloseToPixel(values.x);
			expect(meta.data[i]._model.y).toBeCloseToPixel(values.y);
		});
	});

	it('should get the correct bar points for grouped stacked chart', function() {
		var chart = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [{
					data: [1, 2],
					stack: 'stack1'
				}, {
					data: [0.5, 1],
					stack: 'stack2'
				}, {
					data: [0.5, 1],
					stack: 'stack2'
				}],
				labels: ['label1', 'label2', 'label3', 'label4']
			},
			options: {
				legend: false,
				title: false,
				scales: {
					xAxes: [{
						type: 'category',
						display: false
					}],
					yAxes: [{
						type: 'linear',
						display: false,
						stacked: true
					}]
				}
			}
		});

		var meta = chart.getDatasetMeta(2);

		[
			{b: 384, x: 89, y: 256},
			{b: 256, x: 217, y: 0}
		].forEach(function(values, i) {
			expect(meta.data[i]._model.base).toBeCloseToPixel(values.b);
			expect(meta.data[i]._model.width).toBeCloseToPixel(46);
			expect(meta.data[i]._model.x).toBeCloseToPixel(values.x);
			expect(meta.data[i]._model.y).toBeCloseToPixel(values.y);
		});
	});

	it('should update elements when the scales are stacked and the y axis is logarithmic', function() {
		var chart = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [{
					data: [10, 100, 10, 100],
					label: 'dataset1'
				}, {
					data: [100, 10, 0, 100],
					label: 'dataset2'
				}],
				labels: ['label1', 'label2', 'label3', 'label4']
			},
			options: {
				legend: false,
				title: false,
				scales: {
					xAxes: [{
						type: 'category',
						display: false,
						stacked: true,
						barPercentage: 1,
					}],
					yAxes: [{
						type: 'logarithmic',
						display: false,
						stacked: true
					}]
				}
			}
		});

		var meta0 = chart.getDatasetMeta(0);

		[
			{b: 512, w: 102, x: 64, y: 512},
			{b: 512, w: 102, x: 192, y: 118},
			{b: 512, w: 102, x: 320, y: 512},
			{b: 512, w: 102, x: 449, y: 118}
		].forEach(function(values, i) {
			expect(meta0.data[i]._model.base).toBeCloseToPixel(values.b);
			expect(meta0.data[i]._model.width).toBeCloseToPixel(values.w);
			expect(meta0.data[i]._model.x).toBeCloseToPixel(values.x);
			expect(meta0.data[i]._model.y).toBeCloseToPixel(values.y);
		});

		var meta1 = chart.getDatasetMeta(1);

		[
			{b: 512, w: 102, x: 64, y: 102},
			{b: 118, w: 102, x: 192, y: 102},
			{b: 512, w: 102, x: 320, y: 512},
			{b: 118, w: 102, x: 449, y: 0}
		].forEach(function(values, i) {
			expect(meta1.data[i]._model.base).toBeCloseToPixel(values.b);
			expect(meta1.data[i]._model.width).toBeCloseToPixel(values.w);
			expect(meta1.data[i]._model.x).toBeCloseToPixel(values.x);
			expect(meta1.data[i]._model.y).toBeCloseToPixel(values.y);
		});
	});

	it('should draw all bars', function() {
		var chart = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [{
					data: [],
				}, {
					data: [10, 15, 0, -4],
					label: 'dataset2'
				}],
				labels: ['label1', 'label2', 'label3', 'label4']
			}
		});

		var meta = chart.getDatasetMeta(1);

		spyOn(meta.data[0], 'draw');
		spyOn(meta.data[1], 'draw');
		spyOn(meta.data[2], 'draw');
		spyOn(meta.data[3], 'draw');

		chart.update();

		expect(meta.data[0].draw.calls.count()).toBe(1);
		expect(meta.data[1].draw.calls.count()).toBe(1);
		expect(meta.data[2].draw.calls.count()).toBe(1);
		expect(meta.data[3].draw.calls.count()).toBe(1);
	});

	it('should set hover styles on rectangles', function() {
		var chart = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [{
					data: [],
				}, {
					data: [10, 15, 0, -4],
					label: 'dataset2'
				}],
				labels: ['label1', 'label2', 'label3', 'label4']
			},
			options: {
				elements: {
					rectangle: {
						backgroundColor: 'rgb(255, 0, 0)',
						borderColor: 'rgb(0, 0, 255)',
						borderWidth: 2,
					}
				}
			}
		});

		var meta = chart.getDatasetMeta(1);
		var bar = meta.data[0];

		meta.controller.setHoverStyle(bar);
		expect(bar._model.backgroundColor).toBe('rgb(230, 0, 0)');
		expect(bar._model.borderColor).toBe('rgb(0, 0, 230)');
		expect(bar._model.borderWidth).toBe(2);

		// Set a dataset style
		chart.data.datasets[1].hoverBackgroundColor = 'rgb(128, 128, 128)';
		chart.data.datasets[1].hoverBorderColor = 'rgb(0, 0, 0)';
		chart.data.datasets[1].hoverBorderWidth = 5;

		meta.controller.setHoverStyle(bar);
		expect(bar._model.backgroundColor).toBe('rgb(128, 128, 128)');
		expect(bar._model.borderColor).toBe('rgb(0, 0, 0)');
		expect(bar._model.borderWidth).toBe(5);

		// Should work with array styles so that we can set per bar
		chart.data.datasets[1].hoverBackgroundColor = ['rgb(255, 255, 255)', 'rgb(128, 128, 128)'];
		chart.data.datasets[1].hoverBorderColor = ['rgb(9, 9, 9)', 'rgb(0, 0, 0)'];
		chart.data.datasets[1].hoverBorderWidth = [2.5, 5];

		meta.controller.setHoverStyle(bar);
		expect(bar._model.backgroundColor).toBe('rgb(255, 255, 255)');
		expect(bar._model.borderColor).toBe('rgb(9, 9, 9)');
		expect(bar._model.borderWidth).toBe(2.5);

		// Should allow a custom style
		bar.custom = {
			hoverBackgroundColor: 'rgb(255, 0, 0)',
			hoverBorderColor: 'rgb(0, 255, 0)',
			hoverBorderWidth: 1.5
		};

		meta.controller.setHoverStyle(bar);
		expect(bar._model.backgroundColor).toBe('rgb(255, 0, 0)');
		expect(bar._model.borderColor).toBe('rgb(0, 255, 0)');
		expect(bar._model.borderWidth).toBe(1.5);
	});

	it('should remove a hover style from a bar', function() {
		var chart = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [{
					data: [],
				}, {
					data: [10, 15, 0, -4],
					label: 'dataset2'
				}],
				labels: ['label1', 'label2', 'label3', 'label4']
			},
			options: {
				elements: {
					rectangle: {
						backgroundColor: 'rgb(255, 0, 0)',
						borderColor: 'rgb(0, 0, 255)',
						borderWidth: 2,
					}
				}
			}
		});

		var meta = chart.getDatasetMeta(1);
		var bar = meta.data[0];

		// Change default
		chart.options.elements.rectangle.backgroundColor = 'rgb(128, 128, 128)';
		chart.options.elements.rectangle.borderColor = 'rgb(15, 15, 15)';
		chart.options.elements.rectangle.borderWidth = 3.14;

		// Remove to defaults
		meta.controller.removeHoverStyle(bar);
		expect(bar._model.backgroundColor).toBe('rgb(128, 128, 128)');
		expect(bar._model.borderColor).toBe('rgb(15, 15, 15)');
		expect(bar._model.borderWidth).toBe(3.14);

		// Should work with array styles so that we can set per bar
		chart.data.datasets[1].backgroundColor = ['rgb(255, 255, 255)', 'rgb(128, 128, 128)'];
		chart.data.datasets[1].borderColor = ['rgb(9, 9, 9)', 'rgb(0, 0, 0)'];
		chart.data.datasets[1].borderWidth = [2.5, 5];

		meta.controller.removeHoverStyle(bar);
		expect(bar._model.backgroundColor).toBe('rgb(255, 255, 255)');
		expect(bar._model.borderColor).toBe('rgb(9, 9, 9)');
		expect(bar._model.borderWidth).toBe(2.5);

		// Should allow a custom style
		bar.custom = {
			backgroundColor: 'rgb(255, 0, 0)',
			borderColor: 'rgb(0, 255, 0)',
			borderWidth: 1.5
		};

		meta.controller.removeHoverStyle(bar);
		expect(bar._model.backgroundColor).toBe('rgb(255, 0, 0)');
		expect(bar._model.borderColor).toBe('rgb(0, 255, 0)');
		expect(bar._model.borderWidth).toBe(1.5);
	});

	describe('Bar width', function() {
		beforeEach(function() {
			// 2 datasets
			this.data = {
				labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
				datasets: [{
					data: [10, 20, 30, 40, 50, 60, 70],
				}, {
					data: [10, 20, 30, 40, 50, 60, 70],
				}]
			};
		});

		afterEach(function() {
			var chart = window.acquireChart(this.config);
			var meta = chart.getDatasetMeta(0);
			var xScale = chart.scales[meta.xAxisID];

			var categoryPercentage = xScale.options.categoryPercentage;
			var barPercentage = xScale.options.barPercentage;
			var stacked = xScale.options.stacked;

			var totalBarWidth = 0;
			for (var i = 0; i < chart.data.datasets.length; i++) {
				var bars = chart.getDatasetMeta(i).data;
				for (var j = xScale.minIndex; j <= xScale.maxIndex; j++) {
					totalBarWidth += bars[j]._model.width;
				}
				if (stacked) {
					break;
				}
			}

			var actualValue = totalBarWidth;
			var expectedValue = xScale.width * categoryPercentage * barPercentage;
			expect(actualValue).toBeCloseToPixel(expectedValue);

		});

		it('should correctly set bar width when min and max option is set.', function() {
			this.config = {
				type: 'bar',
				data: this.data,
				options: {
					scales: {
						xAxes: [{
							ticks: {
								min: 'March',
								max: 'May',
							},
						}]
					}
				}
			};
		});

		it('should correctly set bar width when scale are stacked with min and max options.', function() {
			this.config = {
				type: 'bar',
				data: this.data,
				options: {
					scales: {
						xAxes: [{
							ticks: {
								min: 'March',
								max: 'May',
							}
						}],
						yAxes: [{
							stacked: true
						}]
					}
				}
			};
		});
	});

	describe('Bar height (horizontalBar type)', function() {
		beforeEach(function() {
			// 2 datasets
			this.data = {
				labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
				datasets: [{
					data: [10, 20, 30, 40, 50, 60, 70],
				}, {
					data: [10, 20, 30, 40, 50, 60, 70],
				}]
			};
		});

		afterEach(function() {
			var chart = window.acquireChart(this.config);
			var meta = chart.getDatasetMeta(0);
			var yScale = chart.scales[meta.yAxisID];

			var categoryPercentage = yScale.options.categoryPercentage;
			var barPercentage = yScale.options.barPercentage;
			var stacked = yScale.options.stacked;

			var totalBarHeight = 0;
			for (var i = 0; i < chart.data.datasets.length; i++) {
				var bars = chart.getDatasetMeta(i).data;
				for (var j = yScale.minIndex; j <= yScale.maxIndex; j++) {
					totalBarHeight += bars[j]._model.height;
				}
				if (stacked) {
					break;
				}
			}

			var actualValue = totalBarHeight;
			var expectedValue = yScale.height * categoryPercentage * barPercentage;
			expect(actualValue).toBeCloseToPixel(expectedValue);

		});

		it('should correctly set bar height when min and max option is set.', function() {
			this.config = {
				type: 'horizontalBar',
				data: this.data,
				options: {
					scales: {
						yAxes: [{
							ticks: {
								min: 'March',
								max: 'May',
							},
						}]
					}
				}
			};
		});

		it('should correctly set bar height when scale are stacked with min and max options.', function() {
			this.config = {
				type: 'horizontalBar',
				data: this.data,
				options: {
					scales: {
						xAxes: [{
							stacked: true
						}],
						yAxes: [{
							ticks: {
								min: 'March',
								max: 'May',
							}
						}]
					}
				}
			};
		});
	});

	describe('Bar thickness with a category scale', function() {
		[undefined, 20].forEach(function(barThickness) {
			describe('When barThickness is ' + barThickness, function() {
				beforeEach(function() {
					this.chart = window.acquireChart({
						type: 'bar',
						data: {
							datasets: [{
								data: [1, 2]
							}, {
								data: [1, 2]
							}],
							labels: ['label1', 'label2', 'label3']
						},
						options: {
							legend: false,
							title: false,
							scales: {
								xAxes: [{
									id: 'x',
									type: 'category',
									barThickness: barThickness
								}],
								yAxes: [{
									type: 'linear',
								}]
							}
						}
					});
				});

				it('should correctly set bar width', function() {
					var chart = this.chart;
					var expected, i, ilen, meta;

					if (barThickness) {
						expected = barThickness;
					} else {
						var scale = chart.scales.x;
						var options = chart.options.scales.xAxes[0];
						var categoryPercentage = options.categoryPercentage;
						var barPercentage = options.barPercentage;
						var tickInterval = scale.getPixelForTick(1) - scale.getPixelForTick(0);

						expected = tickInterval * categoryPercentage / 2 * barPercentage;
					}

					for (i = 0, ilen = chart.data.datasets.length; i < ilen; ++i) {
						meta = chart.getDatasetMeta(i);
						expect(meta.data[0]._model.width).toBeCloseToPixel(expected);
						expect(meta.data[1]._model.width).toBeCloseToPixel(expected);
					}
				});

				it('should correctly set bar width if maxBarThickness is specified', function() {
					var chart = this.chart;
					var options = chart.options.scales.xAxes[0];
					var i, ilen, meta;

					options.maxBarThickness = 10;
					chart.update();

					for (i = 0, ilen = chart.data.datasets.length; i < ilen; ++i) {
						meta = chart.getDatasetMeta(i);
						expect(meta.data[0]._model.width).toBeCloseToPixel(10);
						expect(meta.data[1]._model.width).toBeCloseToPixel(10);
					}
				});
			});
		});
	});
});

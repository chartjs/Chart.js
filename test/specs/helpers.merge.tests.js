describe('Merge helper tests', function() {

	var helpers;

	beforeAll(function() {
		helpers = window.Chart.helpers;
	});

	it('should merge a normal config without scales', function() {
		var baseConfig = {
			valueProp: 5,
			arrayProp: [1, 2, 3, 4, 5, 6],
			objectProp: {
				prop1: 'abc',
				prop2: 56
			}
		};

		var toMerge = {
			valueProp2: null,
			arrayProp: ['a', 'c'],
			objectProp: {
				prop1: 'c',
				prop3: 'prop3'
			}
		};

		var merged = helpers.configMerge(baseConfig, toMerge);
		expect(merged).toEqual({
			valueProp: 5,
			valueProp2: null,
			arrayProp: ['a', 'c'],
			objectProp: {
				prop1: 'c',
				prop2: 56,
				prop3: 'prop3'
			}
		});
	});

	it('should merge scale configs', function() {
		var baseConfig = {
			scales: {
				prop1: {
					abc: 123,
					def: '456'
				},
				prop2: 777,
				yAxes: [{
					type: 'linear',
				}, {
					type: 'log'
				}]
			}
		};

		var toMerge = {
			scales: {
				prop1: {
					def: 'bbb',
					ghi: 78
				},
				prop2: null,
				yAxes: [{
					type: 'linear',
					axisProp: 456
				}, {
					// pulls in linear default config since axis type changes
					type: 'linear',
					position: 'right'
				}, {
					// Pulls in linear default config since axis not in base
					type: 'linear'
				}]
			}
		};

		var merged = helpers.configMerge(baseConfig, toMerge);
		expect(merged).toEqual({
			scales: {
				prop1: {
					abc: 123,
					def: 'bbb',
					ghi: 78
				},
				prop2: null,
				yAxes: [{
					type: 'linear',
					axisProp: 456
				}, {
					display: true,

					gridLines: {
						color: 'rgba(0, 0, 0, 0.1)',
						drawBorder: true,
						drawOnChartArea: true,
						drawTicks: true, // draw ticks extending towards the label
						tickMarkLength: 10,
						lineWidth: 1,
						offsetGridLines: false,
						display: true,
						zeroLineColor: 'rgba(0,0,0,0.25)',
						zeroLineWidth: 1,
						zeroLineBorderDash: [],
						zeroLineBorderDashOffset: 0.0,
						borderDash: [],
						borderDashOffset: 0.0
					},
					position: 'right',
					offset: false,
					scaleLabel: Chart.defaults.scale.scaleLabel,
					ticks: {
						beginAtZero: false,
						minRotation: 0,
						maxRotation: 50,
						mirror: false,
						padding: 0,
						reverse: false,
						display: true,
						callback: merged.scales.yAxes[1].ticks.callback, // make it nicer, then check explicitly below
						autoSkip: true,
						autoSkipPadding: 0,
						labelOffset: 0,
						minor: {},
						major: {},
					},
					type: 'linear'
				}, {
					display: true,

					gridLines: {
						color: 'rgba(0, 0, 0, 0.1)',
						drawBorder: true,
						drawOnChartArea: true,
						drawTicks: true, // draw ticks extending towards the label,
						tickMarkLength: 10,
						lineWidth: 1,
						offsetGridLines: false,
						display: true,
						zeroLineColor: 'rgba(0,0,0,0.25)',
						zeroLineWidth: 1,
						zeroLineBorderDash: [],
						zeroLineBorderDashOffset: 0.0,
						borderDash: [],
						borderDashOffset: 0.0
					},
					position: 'left',
					offset: false,
					scaleLabel: Chart.defaults.scale.scaleLabel,
					ticks: {
						beginAtZero: false,
						minRotation: 0,
						maxRotation: 50,
						mirror: false,
						padding: 0,
						reverse: false,
						display: true,
						callback: merged.scales.yAxes[2].ticks.callback, // make it nicer, then check explicitly below
						autoSkip: true,
						autoSkipPadding: 0,
						labelOffset: 0,
						minor: {},
						major: {},
					},
					type: 'linear'
				}]
			}
		});

		// Are these actually functions
		expect(merged.scales.yAxes[1].ticks.callback).toEqual(jasmine.any(Function));
		expect(merged.scales.yAxes[2].ticks.callback).toEqual(jasmine.any(Function));
	});
});

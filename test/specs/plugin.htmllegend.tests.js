// Test the HTML Legend plugin
describe('HTML Legend block tests', function() {
	it('Should be constructed', function() {
		var htmllegend = new Chart.HTMLLegend({});
		expect(htmllegend).not.toBe(undefined);
	});

	it('should have the correct default config', function() {
		expect(Chart.defaults.global.htmllegend).toEqual(undefined);
	});

	it('should auto-generate user-configured filtered legend and attach to DOM', function() {
		var legendContainer = document.createElement('div');
		var chart = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [{
					label: 'dataset1',
					backgroundColor: '#f31',
					borderCapStyle: 'butt',
					borderDash: [2, 2],
					borderDashOffset: 5.5,
					data: []
				}, {
					label: 'dataset2',
					hidden: true,
					borderJoinStyle: 'miter',
					data: [],
					legendHidden: true
				}, {
					// label undefined should create empty label
					borderWidth: 10,
					borderColor: 'green',
					pointStyle: 'crossRot',
					data: [],
					hidden: true
				}],
				labels: []
			},
			options: {
				htmllegend: {
					hiddenClass: 'notVisible',
					nodes: {
						container: { // missing tag-property should default to 'div'
							attributes: {
								id: 'legend-{chartId}',
								classList: ['chartjs-legend', '{chartId}-legend'] // pass multiple classes as array
							}
						},
						items: {
							tag: 'li',
							attributes: {
								classList: ['dataset-{datasetIndex}', 'id-{id}', '{unknow}-property']
							}
						},
						box: {
							tag: 'span',
							attributes: {
								style: {
									borderStyle: 'dotted' // override border-style
								}
							}
						},
						label: 'span', // simple syntax
					},
					target: legendContainer // should auto-generate
				},
				legend: {
					labels: {
						filter: function(legendItem, data) {
							var dataset = data.datasets[legendItem.datasetIndex];
							return !dataset.legendHidden;
						}
					}
				}
			}
		});

		var expectedLegend = '<div class="chartjs-legend ' + chart.id + '-legend" id="legend-' + chart.id + '"><li class="dataset-0 id-0 unknow-property"><span style="background-color: rgb(255, 51, 17); border-style: dotted; border-color: rgba(0, 0, 0, 0.1); border-width: 3px;"></span><span>dataset1</span></li><li class="dataset-2 id-1 unknow-property notVisible"><span style="background-color: rgba(0, 0, 0, 0.1); border-style: dotted; border-color: green; border-width: 10px;"></span><span></span></li></div>';

		// check auto-generated legend
		var legend = legendContainer.childNodes[0];
		expect(legend.nodeType).toBe(Node.ELEMENT_NODE); // should return DOM node
		expect(legend.nodeName).toBe('DIV');
		expect(legend.outerHTML).toBe(expectedLegend);

		// check manually created DOM legend
		legendContainer.innerHTML = ''; // remove legend
		legend = chart.generateLegend(legendContainer); // should recreate legend
		expect(legend.nodeType).toBe(Node.ELEMENT_NODE); // should return DOM node
		expect(legend.nodeName).toBe('DIV');
		expect(legend).toBe(legendContainer.childNodes[0]); // container should contain legend
		expect(legend.outerHTML).toBe(expectedLegend);

		// check if HTML generated legend still is attached to DOM
		legendContainer.innerHTML = ''; // remove legend
		chart.options.htmllegend.output = 'HTML';
		legend = chart.generateLegend(legendContainer); // should recreate HTML legend
		expect(legend).toBe(legendContainer.childNodes[0].outerHTML); // container should contain legend
		expect(legend).toBe(expectedLegend);
	});

	it('should use user defined function', function() {
		var chart = window.acquireChart({
			type: 'bar',
			data: {},
			options: {
				htmllegend: {
					callback: function() {
						return '<div>options.htmllegend.callback</div>';
					}
				}
			}
		});

		// check callback function
		expect(chart.generateLegend()).toBe('<div>options.htmllegend.callback</div>');

		// set direct callback function setting
		chart.options.htmllegend = function() {
			return '<div>options.htmllegend</div>';
		};
		expect(chart.generateLegend()).toBe('<div>options.htmllegend</div>');
	});
});

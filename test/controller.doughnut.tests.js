// Test the bar controller
describe('Doughnut controller tests', function() {
	it('Should be constructed', function() {
		var chart = {
			data: {
				datasets: [{
					data: []
				}]
			}
		};

		var controller = new Chart.controllers.doughnut(chart, 0);
		expect(controller).not.toBe(undefined);
		expect(controller.index).toBe(0);
		expect(chart.data.datasets[0].metaData).toEqual([]);

		controller.updateIndex(1);
		expect(controller.index).toBe(1);
	});

	it('Should create arc elements for each data item during initialization', function() {
		var chart = {
			data: {
				datasets: [{
					data: [10, 15, 0, 4]
				}]
			},
			config: {
				type: 'doughnut'
			},
			options: {
			}
		};

		var controller = new Chart.controllers.doughnut(chart, 0);

		expect(chart.data.datasets[0].metaData.length).toBe(4); // 4 rectangles created
		expect(chart.data.datasets[0].metaData[0] instanceof Chart.elements.Arc).toBe(true);
		expect(chart.data.datasets[0].metaData[1] instanceof Chart.elements.Arc).toBe(true);
		expect(chart.data.datasets[0].metaData[2] instanceof Chart.elements.Arc).toBe(true);
		expect(chart.data.datasets[0].metaData[3] instanceof Chart.elements.Arc).toBe(true);
	});

	it ('Should reset and update elements', function() {
		var chart = {
			chartArea: {
				left: 0,
				top: 0,
				right: 100,
				bottom: 200,
			},
			data: {
				datasets: [{
					hidden: true
				}, {
					data: [10, 15, 0, 4]
				}, {
					data: [1]
				}],
				labels: ['label0', 'label1', 'label2', 'label3']
			},
			config: {
				type: 'doughnut'
			},
			options: {
				animation: {
					animateRotate: false,
					animateScale: false
				},
				cutoutPercentage: 50,
				elements: {
					arc: {
						backgroundColor: 'rgb(255, 0, 0)',
						borderColor: 'rgb(0, 0, 255)',
						borderWidth: 2,
						hoverBackgroundColor: 'rgb(255, 255, 255)'
					}
				}
			}
		};

		var controller = new Chart.controllers.doughnut(chart, 1);
		controller.reset(); // reset first

		expect(chart.data.datasets[1].metaData[0]._model).toEqual(jasmine.objectContaining({
			x: 50,
			y: 100,
			startAngle: Math.PI * -0.5,
			endAngle: Math.PI * -0.5,
			circumference: 2.166614539857563,
			outerRadius: 49,
			innerRadius: 36.75
		}));

		expect(chart.data.datasets[1].metaData[1]._model).toEqual(jasmine.objectContaining({
			x: 50,
			y: 100,
			startAngle: Math.PI * -0.5,
			endAngle: Math.PI * -0.5,
			circumference: 3.2499218097863447,
			outerRadius: 49,
			innerRadius: 36.75
		}));

		expect(chart.data.datasets[1].metaData[2]._model).toEqual(jasmine.objectContaining({
			x: 50,
			y: 100,
			startAngle: Math.PI * -0.5,
			endAngle: Math.PI * -0.5,
			circumference: 0,
			outerRadius: 49,
			innerRadius: 36.75
		}));

		expect(chart.data.datasets[1].metaData[3]._model).toEqual(jasmine.objectContaining({
			x: 50,
			y: 100,
			startAngle: Math.PI * -0.5,
			endAngle: Math.PI * -0.5,
			circumference: 0.8666458159430251,
			outerRadius: 49,
			innerRadius: 36.75
		}));

		controller.update();

		expect(chart.data.datasets[1].metaData[0]._model).toEqual(jasmine.objectContaining({
			x: 50,
			y: 100,
			startAngle: Math.PI * -0.5,
			endAngle: 0.5958182130626666,
			circumference: 2.166614539857563,
			outerRadius: 49,
			innerRadius: 36.75,

			backgroundColor: 'rgb(255, 0, 0)',
			borderColor: 'rgb(0, 0, 255)',
			borderWidth: 2,
			hoverBackgroundColor: 'rgb(255, 255, 255)',

			label: 'label0',
		}));

		expect(chart.data.datasets[1].metaData[1]._model).toEqual(jasmine.objectContaining({
			x: 50,
			y: 100,
			startAngle: 0.5958182130626666,
			endAngle: 3.8457400228490113,
			circumference: 3.2499218097863447,
			outerRadius: 49,
			innerRadius: 36.75,

			backgroundColor: 'rgb(255, 0, 0)',
			borderColor: 'rgb(0, 0, 255)',
			borderWidth: 2,
			hoverBackgroundColor: 'rgb(255, 255, 255)',

			label: 'label1'
		}));

		expect(chart.data.datasets[1].metaData[2]._model).toEqual(jasmine.objectContaining({
			x: 50,
			y: 100,
			startAngle: 3.8457400228490113,
			endAngle: 3.8457400228490113,
			circumference: 0,
			outerRadius: 49,
			innerRadius: 36.75,

			backgroundColor: 'rgb(255, 0, 0)',
			borderColor: 'rgb(0, 0, 255)',
			borderWidth: 2,
			hoverBackgroundColor: 'rgb(255, 255, 255)',

			label: 'label2'
		}));

		expect(chart.data.datasets[1].metaData[3]._model).toEqual(jasmine.objectContaining({
			x: 50,
			y: 100,
			startAngle: 3.8457400228490113,
			endAngle: 4.712385838792036,
			circumference: 0.8666458159430251,
			outerRadius: 49,
			innerRadius: 36.75,

			backgroundColor: 'rgb(255, 0, 0)',
			borderColor: 'rgb(0, 0, 255)',
			borderWidth: 2,
			hoverBackgroundColor: 'rgb(255, 255, 255)',
			
			label: 'label3'
		}));

		// Change the amount of data and ensure that arcs are updated accordingly
		chart.data.datasets[1].data = [1, 2]; // remove 2 elements from dataset 0
		controller.buildOrUpdateElements();
		controller.update();

		expect(chart.data.datasets[1].metaData.length).toBe(2);
		expect(chart.data.datasets[1].metaData[0] instanceof Chart.elements.Arc).toBe(true);
		expect(chart.data.datasets[1].metaData[1] instanceof Chart.elements.Arc).toBe(true);

		// Add data
		chart.data.datasets[1].data = [1, 2, 3, 4];
		controller.buildOrUpdateElements();
		controller.update();

		expect(chart.data.datasets[1].metaData.length).toBe(4);
		expect(chart.data.datasets[1].metaData[0] instanceof Chart.elements.Arc).toBe(true);
		expect(chart.data.datasets[1].metaData[1] instanceof Chart.elements.Arc).toBe(true);
		expect(chart.data.datasets[1].metaData[2] instanceof Chart.elements.Arc).toBe(true);
		expect(chart.data.datasets[1].metaData[3] instanceof Chart.elements.Arc).toBe(true);
	});

	it ('should draw all arcs', function() {
		var chart = {
			chartArea: {
				left: 0,
				top: 0,
				right: 100,
				bottom: 200,
			},
			data: {
				datasets: [{
					data: [10, 15, 0, 4]
				}],
				labels: ['label0', 'label1', 'label2', 'label3']
			},
			config: {
				type: 'doughnut'
			},
			options: {
				animation: {
					animateRotate: false,
					animateScale: false
				},
				cutoutPercentage: 50,
				elements: {
					arc: {
						backgroundColor: 'rgb(255, 0, 0)',
						borderColor: 'rgb(0, 0, 255)',
						borderWidth: 2,
						hoverBackgroundColor: 'rgb(255, 255, 255)'
					}
				}
			}
		};

		var controller = new Chart.controllers.doughnut(chart, 0);

		spyOn(chart.data.datasets[0].metaData[0], 'draw');
		spyOn(chart.data.datasets[0].metaData[1], 'draw');
		spyOn(chart.data.datasets[0].metaData[2], 'draw');
		spyOn(chart.data.datasets[0].metaData[3], 'draw');

		controller.draw();

		expect(chart.data.datasets[0].metaData[0].draw.calls.count()).toBe(1);
		expect(chart.data.datasets[0].metaData[1].draw.calls.count()).toBe(1);
		expect(chart.data.datasets[0].metaData[2].draw.calls.count()).toBe(1);
		expect(chart.data.datasets[0].metaData[3].draw.calls.count()).toBe(1);
	});

	it ('should set the hover style of an arc', function() {
		var chart = {
			chartArea: {
				left: 0,
				top: 0,
				right: 100,
				bottom: 200,
			},
			data: {
				datasets: [{
					data: [10, 15, 0, 4]
				}],
				labels: ['label0', 'label1', 'label2', 'label3']
			},
			config: {
				type: 'doughnut'
			},
			options: {
				animation: {
					animateRotate: false,
					animateScale: false
				},
				cutoutPercentage: 50,
				elements: {
					arc: {
						backgroundColor: 'rgb(255, 0, 0)',
						borderColor: 'rgb(0, 0, 255)',
						borderWidth: 2,
					}
				}
			}
		};

		var controller = new Chart.controllers.doughnut(chart, 0);
		controller.reset(); // reset first
		controller.update();

		var arc = chart.data.datasets[0].metaData[0];

		controller.setHoverStyle(arc);

		expect(arc._model.backgroundColor).toBe('rgb(230, 0, 0)');
		expect(arc._model.borderColor).toBe('rgb(0, 0, 230)');
		expect(arc._model.borderWidth).toBe(2);

		// Set a dataset style to take precedence
		chart.data.datasets[0].hoverBackgroundColor = 'rgb(9, 9, 9)';
		chart.data.datasets[0].hoverBorderColor = 'rgb(18, 18, 18)';
		chart.data.datasets[0].hoverBorderWidth = 1.56;

		controller.setHoverStyle(arc);

		expect(arc._model.backgroundColor).toBe('rgb(9, 9, 9)');
		expect(arc._model.borderColor).toBe('rgb(18, 18, 18)');
		expect(arc._model.borderWidth).toBe(1.56);

		// Dataset styles can be an array
		chart.data.datasets[0].hoverBackgroundColor = ['rgb(255, 255, 255)', 'rgb(9, 9, 9)'];
		chart.data.datasets[0].hoverBorderColor = ['rgb(18, 18, 18)'];
		chart.data.datasets[0].hoverBorderWidth = [0.1, 1.56];

		controller.setHoverStyle(arc);

		expect(arc._model.backgroundColor).toBe('rgb(255, 255, 255)');
		expect(arc._model.borderColor).toBe('rgb(18, 18, 18)');
		expect(arc._model.borderWidth).toBe(0.1);

		// Element custom styles also work
		arc.custom = {
			hoverBackgroundColor: 'rgb(7, 7, 7)',
			hoverBorderColor: 'rgb(17, 17, 17)',
			hoverBorderWidth: 3.14159,
		};

		controller.setHoverStyle(arc);

		expect(arc._model.backgroundColor).toBe('rgb(7, 7, 7)');
		expect(arc._model.borderColor).toBe('rgb(17, 17, 17)');
		expect(arc._model.borderWidth).toBe(3.14159);
	});

	it ('should unset the hover style of an arc', function() {
		var chart = {
			chartArea: {
				left: 0,
				top: 0,
				right: 100,
				bottom: 200,
			},
			data: {
				datasets: [{
					data: [10, 15, 0, 4]
				}],
				labels: ['label0', 'label1', 'label2', 'label3']
			},
			config: {
				type: 'doughnut'
			},
			options: {
				animation: {
					animateRotate: false,
					animateScale: false
				},
				cutoutPercentage: 50,
				elements: {
					arc: {
						backgroundColor: 'rgb(255, 0, 0)',
						borderColor: 'rgb(0, 0, 255)',
						borderWidth: 2,
					}
				}
			}
		};

		var controller = new Chart.controllers.doughnut(chart, 0);
		controller.reset(); // reset first
		controller.update();

		var arc = chart.data.datasets[0].metaData[0];

		controller.removeHoverStyle(arc);

		expect(arc._model.backgroundColor).toBe('rgb(255, 0, 0)');
		expect(arc._model.borderColor).toBe('rgb(0, 0, 255)');
		expect(arc._model.borderWidth).toBe(2);

		// Set a dataset style to take precedence
		chart.data.datasets[0].backgroundColor = 'rgb(9, 9, 9)';
		chart.data.datasets[0].borderColor = 'rgb(18, 18, 18)';
		chart.data.datasets[0].borderWidth = 1.56;

		controller.removeHoverStyle(arc);

		expect(arc._model.backgroundColor).toBe('rgb(9, 9, 9)');
		expect(arc._model.borderColor).toBe('rgb(18, 18, 18)');
		expect(arc._model.borderWidth).toBe(1.56);

		// Dataset styles can be an array
		chart.data.datasets[0].backgroundColor = ['rgb(255, 255, 255)', 'rgb(9, 9, 9)'];
		chart.data.datasets[0].borderColor = ['rgb(18, 18, 18)'];
		chart.data.datasets[0].borderWidth = [0.1, 1.56];

		controller.removeHoverStyle(arc);

		expect(arc._model.backgroundColor).toBe('rgb(255, 255, 255)');
		expect(arc._model.borderColor).toBe('rgb(18, 18, 18)');
		expect(arc._model.borderWidth).toBe(0.1);

		// Element custom styles also work
		arc.custom = {
			backgroundColor: 'rgb(7, 7, 7)',
			borderColor: 'rgb(17, 17, 17)',
			borderWidth: 3.14159,
		};

		controller.removeHoverStyle(arc);

		expect(arc._model.backgroundColor).toBe('rgb(7, 7, 7)');
		expect(arc._model.borderColor).toBe('rgb(17, 17, 17)');
		expect(arc._model.borderWidth).toBe(3.14159);
	});
});
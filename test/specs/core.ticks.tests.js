describe('Test tick generators', function() {
	it('Should generate linear spaced ticks with correct precision', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					data: []
				}],
			},
			options: {
				legend: {
					display: false,
				},
				scales: {
					xAxes: [{
						type: 'linear',
						position: 'bottom',
						ticks: {
							callback: function(value) {
								return value.toString();
							}
						}
					}],
					yAxes: [{
						type: 'linear',
						ticks: {
							callback: function(value) {
								return value.toString();
							}
						}
					}]
				}
			}
		});

		var xAxis = chart.scales['x-axis-0'];
		var yAxis = chart.scales['y-axis-0'];

		expect(xAxis.ticks).toEqual(['-1', '-0.8', '-0.6', '-0.4', '-0.2', '0', '0.2', '0.4', '0.6', '0.8', '1']);
		expect(yAxis.ticks).toEqual(['1', '0.8', '0.6', '0.4', '0.2', '0', '-0.2', '-0.4', '-0.6', '-0.8', '-1']);
	});

	it('Should generate logarithmic spaced ticks with correct precision', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					data: []
				}],
			},
			options: {
				legend: {
					display: false,
				},
				scales: {
					xAxes: [{
						type: 'logarithmic',
						position: 'bottom',
						ticks: {
							min: 0.1,
							max: 1,
							callback: function(value) {
								return value.toString();
							}
						}
					}],
					yAxes: [{
						type: 'logarithmic',
						ticks: {
							min: 0.1,
							max: 1,
							callback: function(value) {
								return value.toString();
							}
						}
					}]
				}
			}
		});

		var xAxis = chart.scales['x-axis-0'];
		var yAxis = chart.scales['y-axis-0'];

		expect(xAxis.ticks).toEqual(['0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1']);
		expect(yAxis.ticks).toEqual(['1', '0.9', '0.8', '0.7', '0.6', '0.5', '0.4', '0.3', '0.2', '0.1']);
	});
});

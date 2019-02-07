var utils = Samples.utils;

// CSP: disable automatic style injection
Chart.platform.disableCSSInjection = true;

utils.srand(110);

function generateData() {
	var DATA_COUNT = 16;
	var MIN_XY = -150;
	var MAX_XY = 100;
	var data = [];
	var i;

	for (i = 0; i < DATA_COUNT; ++i) {
		data.push({
			x: utils.rand(MIN_XY, MAX_XY),
			y: utils.rand(MIN_XY, MAX_XY),
			v: utils.rand(0, 1000)
		});
	}

	return data;
}

window.addEventListener('load', function() {
	new Chart('chart-0', {
		type: 'bubble',
		data: {
			datasets: [{
				backgroundColor: utils.color(0),
				data: generateData()
			}, {
				backgroundColor: utils.color(1),
				data: generateData()
			}]
		},
		options: {
			aspectRatio: 1,
			legend: false,
			tooltip: false,
			elements: {
				point: {
					radius: function(context) {
						var value = context.dataset.data[context.dataIndex];
						var size = context.chart.width;
						var base = Math.abs(value.v) / 1000;
						return (size / 24) * base;
					}
				}
			}
		}
	});
});

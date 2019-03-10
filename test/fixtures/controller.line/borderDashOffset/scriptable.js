module.exports = {
	config: {
		type: 'line',
		data: {
			labels: [0, 1, 2, 3, 4, 5],
			datasets: [
				{
					// option in dataset
					data: [1, 1, 1, 1, 1, 1],
					borderColor: '#ff0000',
					borderDash: [20],
					borderDashOffset: function(ctx) {
						var dataTotal = ctx.dataset.data.reduce(function(a, b) {
							return a + b;
						});
						var offset = dataTotal > 0 ? 5.0 : 0.0;

						return offset;
					}
				},
				{
					// option in element (fallback)
					data: [-1, -1, -1, -1, -1, -1],
				}
			]
		},
		options: {
			legend: false,
			title: false,
			elements: {
				line: {
					borderColor: '#00ff00',
					borderDash: [20],
					borderDashOffset: function(ctx) {
						var dataTotal = ctx.dataset.data.reduce(function(a, b) {
							return a + b;
						});
						var offset = dataTotal > 0 ? 5.0 : 0.0;

						return offset;
					},
					fill: false,
				},
				point: {
					radius: 10,
				}
			},
			scales: {
				xAxes: [{display: false}],
				yAxes: [{display: false}]
			}
		}
	},
	options: {
		canvas: {
			height: 256,
			width: 512
		}
	}
};

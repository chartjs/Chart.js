module.exports = {
	config: {
		type: 'line',
		data: {
			labels: [0, 1, 2, 3, 4, 5],
			datasets: [
				{
					// option in dataset
					data: [0, 4, 2, 6, 4, 8],
					borderColor: '#ff0000',
					cubicInterpolationMode: function(ctx) {
						var mode = ctx.datasetIndex === 0 ? 'monotone' : 'default';

						return mode;
					}
				},
				{
					// option in element (fallback)
					data: [0, 4, 2, 6, 4, 8],
				}
			]
		},
		options: {
			legend: false,
			title: false,
			elements: {
				line: {
					borderColor: '#00ff00',
					cubicInterpolationMode: function(ctx) {
						var mode = ctx.datasetIndex === 0 ? 'monotone' : 'default';

						return mode;
					},
					fill: false
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

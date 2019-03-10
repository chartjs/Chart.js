module.exports = {
	config: {
		type: 'line',
		data: {
			labels: [0, 1, 2, 3, 4, 5],
			datasets: [
				{
					// option in dataset
					data: [-2, -6, -4, -8, -6, -10],
					backgroundColor: '#ff0000',
					fill: function(ctx) {
						var dataTotal = ctx.dataset.data.reduce(function(a, b) {
							return a + b;
						});
						var fill = dataTotal > 0 ? true : false;

						return fill;
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
					backgroundColor: '#00ff00',
					fill: function(ctx) {
						var dataTotal = ctx.dataset.data.reduce(function(a, b) {
							return a + b;
						});
						var fill = dataTotal > 0 ? true : false;

						return fill;
					}
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

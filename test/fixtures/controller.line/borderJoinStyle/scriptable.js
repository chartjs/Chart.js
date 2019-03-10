module.exports = {
	config: {
		type: 'line',
		data: {
			labels: [0, 1, 2, 3, 4, 5],
			datasets: [
				{
					// option in dataset
					data: [2, 6, 4, 8, 6, 10],
					borderColor: '#ff0000',
					borderJoinStyle: function(ctx) {
						var dataTotal = ctx.dataset.data.reduce(function(a, b) {
							return a + b;
						});
						var joinStyle = dataTotal > 25 ? 'round' : 'miter';

						return joinStyle;
					}
				},
				{
					// option in element (fallback)
					data: [0, 4, 2, 6, 4, 8]
				}
			]
		},
		options: {
			legend: false,
			title: false,
			elements: {
				line: {
					borderColor: '#00ff00',
					borderJoinStyle: function(ctx) {
						var dataTotal = ctx.dataset.data.reduce(function(a, b) {
							return a + b;
						});
						var joinStyle = dataTotal > 25 ? 'round' : 'miter';

						return joinStyle;
					},
					fill: false,
					borderWidth: 10,
					tension: 0
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

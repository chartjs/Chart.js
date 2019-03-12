module.exports = {
	config: {
		type: 'line',
		data: {
			labels: [0, 1, 2, 3, 4, 5],
			datasets: [
				{
					// option in dataset
					data: [4, 5, 10, null, -10, -5],
					borderColor: '#0000ff',
					borderWidth: function(ctx) {
						var dataTotal = ctx.dataset.data.reduce(function(a, b) {
							return a + b;
						});
						return dataTotal > 0 ? 20 : 10;
					}
				},
				{
					// option in element (fallback)
					data: [-4, -5, -10, null, 10, 5],
				}
			]
		},
		options: {
			legend: false,
			title: false,
			spanGaps: true,
			elements: {
				line: {
					fill: false,
					borderColor: '#ff0000',
					borderWidth: function(ctx) {
						var dataTotal = ctx.dataset.data.reduce(function(a, b) {
							return a + b;
						});
						return dataTotal > 0 ? 20 : 2;
					},
				},
				point: {
					radius: 10,
				}
			},
			scales: {
				xAxes: [{display: false}],
				yAxes: [
					{
						display: false,
						ticks: {
							beginAtZero: true
						}
					}
				]
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

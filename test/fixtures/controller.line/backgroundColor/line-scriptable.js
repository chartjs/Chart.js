module.exports = {
	config: {
		type: 'line',
		data: {
			labels: [0, 1, 2, 3, 4, 5],
			datasets: [
				{
					// option in dataset
					data: [4, 5, 10, null, -10, -5],
					backgroundColor: function(ctx) {
						var dataTotal = ctx.dataset.data.reduce(function(a, b) {
							return a + b;
						});
						var c = dataTotal >= 0 ? '#D60000' : '#44DE28';

						return c;
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
			elements: {
				line: {
					backgroundColor: function(ctx) {
						var dataTotal = ctx.dataset.data.reduce(function(a, b) {
							return a + b;
						});
						var c = dataTotal >= 0 ? '#D60000' : '#44DE28';

						return c;
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

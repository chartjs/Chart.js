module.exports = {
	config: {
		type: 'line',
		data: {
			labels: [0, 1, 2, 3, 4, 5],
			datasets: [
				{
					// option in dataset
					data: [4, 5, 10, null, -10, -5],
					borderDash: function(ctx) {
						return ctx.datasetIndex === 0 ? [5] : [10];
					}
				},
				{
					// option in element (fallback)
					data: [-4, -5, -10, null, 10, 5]
				}
			]
		},
		options: {
			legend: false,
			title: false,
			elements: {
				line: {
					borderColor: '#00ff00',
					borderDash: function(ctx) {
						return ctx.datasetIndex === 0 ? [5] : [10];
					}
				},
				point: {
					radius: 10,
				}
			},
			layout: {
				padding: 32
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

module.exports = {
	config: {
		type: 'line',
		data: {
			labels: [0, 1, 2, 3],
			datasets: [
				{
					// option in dataset
					data: [1, 1, 1, 1],
					borderColor: '#ff0000',
					borderDash: [20],
					borderDashOffset: function(ctx) {
						return ctx.datasetIndex === 0 ? 5.0 : 0.0;
					}
				},
				{
					// option in element (fallback)
					data: [0, 0, 0, 0]
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
						return ctx.datasetIndex === 0 ? 5.0 : 0.0;
					},
					fill: false,
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

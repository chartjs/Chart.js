module.exports = {
	config: {
		type: 'radar',
		data: {
			labels: [0, 1, 2, 3, 4, 5],
			datasets: [
				{
					// option in dataset
					data: [0, 5, 10, null, -10, -5],
					borderDash: function(ctx) {
						return ctx.datasetIndex === 0 ? [5] : [10];
					}
				},
				{
					// option in element (fallback)
					data: [4, -5, -10, null, 10, 5]
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
					},
					fill: true,
				},
				point: {
					radius: 10
				}
			},
			scale: {
				display: false,
				min: -15
			}
		}
	},
	options: {
		canvas: {
			height: 512,
			width: 512
		}
	}
};

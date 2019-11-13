module.exports = {
	config: {
		type: 'radar',
		data: {
			labels: [0, 1, 2, 3, 4, 5],
			datasets: [
				{
					// option in dataset
					data: [0, 5, 10, null, -10, -5],
					pointBorderColor: '#0000ff',
					pointBorderWidth: function(ctx) {
						var value = ctx.dataset.data[ctx.dataIndex] || 0;
						return value > 4 ? 10
							: value > -4 ? 5
							: 2;
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
					fill: false
				},
				point: {
					borderColor: '#ff0000',
					borderWidth: function(ctx) {
						var value = ctx.dataset.data[ctx.dataIndex] || 0;
						return value > 4 ? 2
							: value > -4 ? 5
							: 10;
					},
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

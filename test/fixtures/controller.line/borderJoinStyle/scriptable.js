module.exports = {
	config: {
		type: 'line',
		data: {
			labels: [0, 1, 2],
			datasets: [
				{
					// option in dataset
					data: [6, 18, 6],
					borderColor: '#ff0000',
					borderJoinStyle: function(ctx) {
						var index = ctx.datasetIndex % 3;
						return index === 0 ? 'round'
							: index === 1 ? 'miter'
							: 'bevel';
					}
				},
				{
					// option in element (fallback)
					data: [2, 14, 2],
					borderColor: '#0000ff',
				},
				{
					// option in element (fallback)
					data: [-2, 10, -2]
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
						var index = (ctx.datasetIndex % 3);
						return index === 0 ? 'round'
							: index === 1 ? 'miter'
							: 'bevel';
					},
					borderWidth: 25,
					fill: false,
					tension: 0
				}
			},
			layout: {
				padding: 32
			},
			scales: {
				x: {display: false},
				y: {display: false}
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

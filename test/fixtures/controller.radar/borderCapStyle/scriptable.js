module.exports = {
	config: {
		type: 'radar',
		data: {
			labels: [0, 1, 2],
			datasets: [
				{
					// option in dataset
					data: [null, 3, 3],
					borderCapStyle: function(ctx) {
						var index = (ctx.datasetIndex % 2);
						return index === 0 ? 'round'
							: index === 1 ? 'square'
							: 'butt';
					}
				},
				{
					// option in element (fallback)
					data: [null, 2, 2]
				},
				{
					// option in element (fallback)
					data: [null, 1, 1]
				}
			]
		},
		options: {
			legend: false,
			title: false,
			elements: {
				line: {
					borderCapStyle: function(ctx) {
						var index = (ctx.datasetIndex % 3);
						return index === 0 ? 'round'
							: index === 1 ? 'square'
							: 'butt';
					},
					borderColor: '#ff0000',
					borderWidth: 32,
					fill: false
				},
				point: {
					radius: 10
				}
			},
			layout: {
				padding: 32
			},
			scale: {
				display: false,
				beginAtZero: true
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

module.exports = {
	config: {
		type: 'radar',
		data: {
			labels: [0, 1, 2, 3, 4, 5],
			datasets: [
				{
					// option in dataset
					data: [0, 5, 10, null, -10, -5],
					borderColor: function(ctx) {
						var index = (ctx.dataIndex === undefined ? ctx.datasetIndex : ctx.dataIndex);
						return index === 0 ? '#ff0000'
							: index === 1 ? '#00ff00'
							: '#0000ff';
					}
				},
				{
					// option in element (fallback)
					data: [4, -5, -10, null, 10, 5],
				}
			]
		},
		options: {
			legend: false,
			title: false,
			elements: {
				line: {
					borderColor: function(ctx) {
						var index = (ctx.dataIndex === undefined ? ctx.datasetIndex : ctx.dataIndex);
						return index === 0 ? '#ff0000'
							: index === 1 ? '#00ff00'
							: '#0000ff';
					},
					borderWidth: 10,
					fill: false
				},
				point: {
					borderColor: '#ff0000',
					borderWidth: 10,
					radius: 16
				}
			},
			scale: {
				display: false,
				ticks: {
					min: -15
				}
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

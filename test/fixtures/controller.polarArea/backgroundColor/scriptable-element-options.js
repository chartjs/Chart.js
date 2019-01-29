module.exports = {
	config: {
		type: 'polarArea',
		data: {
			labels: [0, 1, 2, 3, 4, 5],
			datasets: [
				{
					// option in element (fallback)
					data: [0, 2, 4, null, 6, 8],
				}
			]
		},
		options: {
			legend: false,
			title: false,
			elements: {
				arc: {
					backgroundColor: function(ctx) {
						var value = ctx.dataset.data[ctx.dataIndex] || 0;
						return value > 8 ? '#ff0000'
							: value > 6 ? '#00ff00'
							: value > 2 ? '#0000ff'
							: '#ff00ff';
					}
				}
			},
			scale: {
				display: false
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

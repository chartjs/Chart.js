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
			elements: {
				arc: {
					backgroundColor: 'transparent',
					borderColor: function(ctx) {
						var value = ctx.dataset.data[ctx.dataIndex] || 0;
						return value > 8 ? '#ff00ff'
							: value > 6 ? '#0000ff'
							: value > 2 ? '#ff0000'
							: '#00ff00';
					},
					borderWidth: 8
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

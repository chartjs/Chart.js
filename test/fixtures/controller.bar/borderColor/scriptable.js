module.exports = {
	config: {
		type: 'bar',
		data: {
			labels: [0, 1, 2, 3, 4, 5],
			datasets: [
				{
					// option in dataset
					data: [0, 5, 10, null, -10, -5],
					borderColor: function(ctx) {
						var value = ctx.dataset.data[ctx.dataIndex] || 0;
						return value > 8 ? '#ff0000'
							: value > 0 ? '#00ff00'
							: value > -8 ? '#0000ff'
							: '#ff00ff';
					}
				},
				{
					// option in element (fallback)
					data: [0, 5, 10, null, -10, -5]
				}
			]
		},
		options: {
			legend: false,
			title: false,
			elements: {
				rectangle: {
					backgroundColor: 'transparent',
					borderColor: function(ctx) {
						var value = ctx.dataset.data[ctx.dataIndex] || 0;
						return value > 8 ? '#ff00ff'
							: value > 0 ? '#0000ff'
							: value > -8 ? '#ff0000'
							: '#00ff00';
					},
					borderWidth: 8
				}
			},
			scales: {
				x: {display: false},
				y: {
					display: false,
					beginAtZero: true
				}
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

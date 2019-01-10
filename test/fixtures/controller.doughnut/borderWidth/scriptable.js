module.exports = {
	config: {
		type: 'doughnut',
		data: {
			labels: [0, 1, 2, 3, 4, 5],
			datasets: [
				{
					// option in dataset
					data: [0, 2, 4, null, 6, 8],
					borderWidth: function(ctx) {
						var value = ctx.dataset.data[ctx.dataIndex] || 0;
						return Math.abs(value);
					}
				},
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
					backgroundColor: 'transparent',
					borderColor: '#888',
					borderWidth: function(ctx) {
						return ctx.dataIndex * 2;
					}
				}
			},
		}
	},
	options: {
		canvas: {
			height: 256,
			width: 512
		}
	}
};

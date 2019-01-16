module.exports = {
	config: {
		type: 'bar',
		data: {
			labels: [0, 1, 2, 3, 4, 5],
			datasets: [
				{
					// option in dataset
					data: [0, 5, 10, null, -10, -5],
					borderSkipped: function(ctx) {
						var value = ctx.dataset.data[ctx.dataIndex] || 0;
						return value > 8 ? 'left'
							: value > 0 ? 'right'
							: value > -8 ? 'top'
							: 'bottom';
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
					borderColor: '#888',
					borderSkipped: function(ctx) {
						var index = ctx.dataIndex;
						return index > 4 ? 'left'
							: index > 3 ? 'right'
							: index > 1 ? 'top'
							: 'bottom';
					},
					borderWidth: 8
				}
			},
			scales: {
				xAxes: [{display: false}],
				yAxes: [
					{
						display: false,
						ticks: {
							beginAtZero: true
						}
					}
				]
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

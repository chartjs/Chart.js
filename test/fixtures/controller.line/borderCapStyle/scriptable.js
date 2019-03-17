module.exports = {
	config: {
		type: 'line',
		data: {
			labels: [0, 1, 2, 3, 4],
			datasets: [
				{
					// option in dataset
					data: [4, null, 3, 3],
					borderCapStyle: function(ctx) {
						var index = (ctx.datasetIndex % 2);
						return index === 0 ? 'round'
							: index === 1 ? 'square'
							: 'butt'
					}
				},
				{
					// option in element (fallback)
					data: [4, null, 2, 2],
				},
				{
					// option in element (fallback)
					data: [4, null, 1, 1],
				}
			]
		},
		options: {
			legend: false,
			title: false,
			elements: {
				line: {
					borderColor: '#D60000',
					borderWidth: 32,
					borderCapStyle: function(ctx) {
						var index = (ctx.datasetIndex % 3);
						return index === 0 ? 'round'
							: index === 1 ? 'square'
							: 'butt'
					}
				},
				point: {
					radius: 10,
				}
			},
			layout: {
				padding: {
					left: 40,
					right: 40
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

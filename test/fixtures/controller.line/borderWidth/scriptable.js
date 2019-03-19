module.exports = {
	config: {
		type: 'line',
		data: {
			labels: [0, 1, 2, 3, 4, 5],
			datasets: [
				{
					// option in dataset
					data: [4, 5, 10, null, -10, -5],
					borderColor: '#0000ff',
					borderWidth: function(ctx) {
						var index = (ctx.dataIndex === undefined ? ctx.datasetIndex : ctx.dataIndex);
						return index % 2 ? 10 : 20;
					},
					pointBorderColor: '#00ff00'
				},
				{
					// option in element (fallback)
					data: [-4, -5, -10, null, 10, 5],
				}
			]
		},
		options: {
			legend: false,
			title: false,
			elements: {
				line: {
					borderColor: '#ff0000',
					borderWidth: function(ctx) {
						var index = (ctx.dataIndex === undefined ? ctx.datasetIndex : ctx.dataIndex);
						return index % 2 ? 10 : 20;
					},
					fill: false,
				},
				point: {
					borderColor: '#00ff00',
					borderWidth: 5,
					radius: 10
				}
			},
			layout: {
				padding: 32
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

module.exports = {
	config: {
		type: 'doughnut',
		data: {
			labels: [0, 1, 2, 3, 4, 5],
			datasets: [
				{
					// option in dataset
					data: [0, 2, 4, null, 6, 8],
					backgroundColor: [
						'#ff0000',
						'#00ff00',
						'#0000ff',
						'#ffff00',
						'#ff00ff',
						'#000000'
					]
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
					backgroundColor: [
						'#ff88ff',
						'#888888',
						'#ff8800',
						'#00ff88',
						'#8800ff',
						'#ffff88'
					]
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

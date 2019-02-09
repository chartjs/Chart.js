module.exports = {
	config: {
		type: 'radar',
		data: {
			labels: [0, 1, 2, 3, 4, 5],
			datasets: [
				{
					// option in dataset
					data: [0, 5, 10, null, -10, -5],
					pointBackgroundColor: [
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
					data: [4, -5, -10, null, 10, 5],
				}
			]
		},
		options: {
			legend: false,
			title: false,
			elements: {
				line: {
					fill: false,
				},
				point: {
					backgroundColor: [
						'#ff88ff',
						'#888888',
						'#ff8800',
						'#00ff88',
						'#8800ff',
						'#ffff88'
					],
					radius: 10
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

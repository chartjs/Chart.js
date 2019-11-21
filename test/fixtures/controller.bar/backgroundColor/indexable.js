module.exports = {
	config: {
		type: 'bar',
		data: {
			labels: [0, 1, 2, 3, 4, 5],
			datasets: [
				{
					// option in dataset
					data: [0, 5, 10, null, -10, -5],
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
					data: [0, 5, 10, null, -10, -5],
				}
			]
		},
		options: {
			legend: false,
			title: false,
			elements: {
				rectangle: {
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
			scales: {
				x: {display: false},
				y: {display: false}
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

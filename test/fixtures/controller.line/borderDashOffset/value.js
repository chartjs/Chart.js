module.exports = {
	config: {
		type: 'line',
		data: {
			labels: [0, 1, 2, 3, 4, 5],
			datasets: [
				{
					// option in dataset
					data: [1, 1, 1, 1, 1, 1],
					borderColor: '#ff0000',
					borderDash: [20],
					borderDashOffset: 5.0
				},
				{
					// option in element (fallback)
					data: [0, 0, 0, 0, 0, 0]
				}
			]
		},
		options: {
			elements: {
				line: {
					borderColor: '#00ff00',
					borderDash: [20],
					borderDashOffset: 0.0, // default
					fill: false,
				},
				point: {
					radius: 10,
				}
			},
			layout: {
				padding: 32
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

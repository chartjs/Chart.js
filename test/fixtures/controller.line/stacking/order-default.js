module.exports = {
	config: {
		type: 'line',
		data: {
			labels: [0, 1, 2, 3, 4, 5],
			datasets: [
				{
					// option in dataset
					data: [3, 1, 2, 0, 8, 1],
					backgroundColor: '#ff0000'
				},
				{
					// option in element (fallback)
					data: [0, 4, 2, 6, 4, 8],
					backgroundColor: '#00ff00'
				}
			]
		},
		options: {
			legend: false,
			title: false,
			elements: {
				line: {
					fill: true
				},
				point: {
					radius: 0
				}
			},
			layout: {
				padding: 32
			},
			scales: {
				x: {stacked: true, display: false},
				y: {stacked: true, display: false}
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

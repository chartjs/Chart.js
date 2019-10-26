module.exports = {
	config: {
		type: 'radar',
		data: {
			labels: [0, 1, 2, 3, 4, 5],
			datasets: [
				{
					// option in dataset
					data: [0, 5, 10, null, -10, -5],
					backgroundColor: '#ff0000',
					fill: false
				},
				{
					// option in element (fallback)
					data: [4, -5, -10, null, 10, 5]
				}
			]
		},
		options: {
			legend: false,
			title: false,
			elements: {
				line: {
					backgroundColor: '#00ff00',
					fill: true
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

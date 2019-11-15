module.exports = {
	config: {
		type: 'radar',
		data: {
			labels: [0, 1, 2],
			datasets: [
				{
					// option in dataset
					data: [null, 3, 3],
					borderCapStyle: 'round'
				},
				{
					// option in dataset
					data: [null, 2, 2],
					borderCapStyle: 'square'
				},
				{
					// option in element (fallback)
					data: [null, 1, 1]
				}
			]
		},
		options: {
			legend: false,
			title: false,
			elements: {
				line: {
					borderCapStyle: 'butt',
					borderColor: '#00ff00',
					borderWidth: 32,
					fill: false
				},
				point: {
					radius: 10
				}
			},
			layout: {
				padding: 32
			},
			scale: {
				display: false,
				beginAtZero: true
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

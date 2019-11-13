module.exports = {
	config: {
		type: 'radar',
		data: {
			labels: [0, 1, 2, 3, 4, 5],
			datasets: [
				{
					// option in dataset
					data: [0, 5, 10, null, -10, -5],
					pointBorderColor: '#00ff00',
					pointBorderWidth: [
						1, 2, 3, 4, 5, 6
					]
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
					fill: false
				},
				point: {
					borderColor: '#ff0000',
					borderWidth: [
						6, 5, 4, 3, 2, 1
					],
					radius: 10
				}
			},
			scale: {
				display: false,
				min: -15
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

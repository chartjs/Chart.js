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
					pointRotation: [
						0, 30, 60, 90, 120, 150
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
					borderColor: '#ff0000',
					borderWidth: 10,
					pointStyle: 'line',
					rotation: [
						150, 120, 90, 60, 30, 0
					],
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

module.exports = {
	config: {
		type: 'line',
		data: {
			labels: [0, 1, 2, 3, 4, 5],
			datasets: [
				{
					// option in dataset
					data: [2, 6, 4, 8, 6, 10],
					borderColor: '#ff0000',
					borderJoinStyle: 'miter',
				},
				{
					// option in element (fallback)
					data: [0, 4, 2, 6, 4, 8]
				}
			]
		},
		options: {
			legend: false,
			title: false,
			elements: {
				line: {
					borderColor: '#00ff00',
					borderJoinStyle: 'round',
					borderWidth: 10,
					fill: false,
					tension: 0
				}
			},
			scales: {
				xAxes: [{display: false}],
				yAxes: [{display: false}]
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

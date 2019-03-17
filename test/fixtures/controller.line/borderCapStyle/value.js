module.exports = {
	config: {
		type: 'line',
		data: {
			labels: [0, 1, 2, 3, 4],
			datasets: [
				{
					// option in dataset
					data: [4, null, 3, 3],
					borderCapStyle: 'round',
				},
				{
					// option in dataset
					data: [4, null, 2, 2],
					borderCapStyle: 'square',
				},
				{
					// option in element (fallback)
					data: [0, null, 1, 1],
				}
			]
		},
		options: {
			legend: false,
			title: false,
			elements: {
				line: {
					borderColor: '#00ff00',
					borderCapStyle: 'butt',
					borderWidth: 32,
					fill: false,
				},
				point: {
					radius: 10,
				}
			},
			layout: {
				padding: {
					left: 40,
					right: 40
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

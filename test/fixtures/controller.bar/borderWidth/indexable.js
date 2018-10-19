module.exports = {
	config: {
		type: 'bar',
		data: {
			labels: [0, 1, 2, 3, 4, 5],
			datasets: [
				{
					// option in dataset
					data: [0, 5, 10, null, -10, -5],
					borderWidth: [
						0,
						1,
						2,
						3,
						4,
						5
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
					backgroundColor: 'transparent',
					borderColor: '#888',
					borderWidth: [
						5,
						4,
						3,
						2,
						1,
						0
					]
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

module.exports = {
	config: {
		type: 'bar',
		data: {
			labels: [0, 1, 2, 3, 4, 5],
			datasets: [
				{
					// option in dataset
					data: [0, 5, 10, null, -10, -5],
					borderWidth: -2
				},
				{
					// option in element (fallback)
					data: [0, 5, 10, null, -10, -5],
				},
				{
					data: [0, 5, 10, null, -10, -5],
					borderWidth: {left: -5, top: -5, bottom: -5, right: -5},
					borderSkipped: false
				},
				{
					data: [0, 5, 10, null, -10, -5],
					borderWidth: {}
				},
			]
		},
		options: {
			legend: false,
			title: false,
			elements: {
				rectangle: {
					backgroundColor: '#888',
					borderColor: '#f00',
					borderWidth: -4
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

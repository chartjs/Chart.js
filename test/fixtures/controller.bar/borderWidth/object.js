module.exports = {
	config: {
		type: 'bar',
		data: {
			labels: [0, 1, 2, 3, 4, 5],
			datasets: [
				{
					// option in dataset
					data: [0, 5, 10, null, -10, -5],
					borderSkipped: false,
					borderWidth: {bottom: 1, left: 2, top: 3, right: 4}
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
					borderSkipped: false,
					borderWidth: {bottom: 4, left: 3, top: 2, right: 1}
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

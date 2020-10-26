module.exports = {
	threshold: 0.01,
	config: {
		type: 'bar',
		data: {
			labels: [0, 1, 2, 3, 4, 5],
			datasets: [
				{
					// option in dataset
					data: [0, 5, 10, null, -10, -5],
					borderWidth: 2,
					borderRadius: 5
				},
				{
					// option in element (fallback)
					data: [0, 5, 10, null, -10, -5],
					borderSkipped: false,
					borderRadius: Number.MAX_VALUE
				}
			]
		},
		options: {
			legend: false,
			title: false,
			indexAxis: 'y',
			elements: {
				bar: {
					backgroundColor: '#AAAAAA80',
					borderColor: '#80808080',
					borderWidth: {bottom: 6, left: 15, top: 6, right: 15}
				}
			},
			scales: {
				x: {display: false},
				y: {display: false}
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

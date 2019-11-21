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
					borderWidth: [
						{},
						{bottom: 1, left: 1, top: 1, right: 1},
						{bottom: 1, left: 2, top: 1, right: 2},
						{bottom: 1, left: 3, top: 1, right: 3},
						{bottom: 1, left: 4, top: 1, right: 4},
						{bottom: 1, left: 5, top: 1, right: 5}
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
					borderColor: '#80808080',
					borderSkipped: false,
					borderWidth: [
						{bottom: 1, left: 5, top: 1, right: 5},
						{bottom: 1, left: 4, top: 1, right: 4},
						{bottom: 1, left: 3, top: 1, right: 3},
						{bottom: 1, left: 2, top: 1, right: 2},
						{bottom: 1, left: 1, top: 1, right: 1},
						{}
					]
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

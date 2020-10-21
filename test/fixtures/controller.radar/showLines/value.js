module.exports = {
	config: {
		type: 'radar',
		data: {
			labels: [0, 1, 2, 3, 4, 5],
			datasets: [
				{
					// option in dataset
					data: [0, 5, 10, null, -10, -5],
					backgroundColor: '#ff0000',
					fill: false,
					showLine: true
				},
				{
					// option in element (fallback)
					data: [4, -5, -10, null, 10, 5]
				},
				{
					data: [1, 1, 1, 1, 1, 1],
					showLine: true,
					backgroundColor: 'rgba(0,0,255,0.5)'
				}
			]
		},
		options: {
			legend: false,
			title: false,
			showLine: false,
			elements: {
				line: {
					borderColor: '#ff0000',
					backgroundColor: 'rgba(0,255,0,0.5)',
					fill: true
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

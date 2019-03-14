module.exports = {
	config: {
		type: 'polarArea',
		data: {
			labels: [0, 1, 2, 3, 4, 5],
			datasets: [
				{
					// option in element (fallback)
					data: [0, 2, 4, null, 6, 8],
				}
			]
		},
		options: {
			legend: false,
			title: false,
			elements: {
				arc: {
					backgroundColor: 'transparent',
					borderColor: '#00ff00',
					borderWidth: 8
				}
			},
			scale: {
				display: false
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

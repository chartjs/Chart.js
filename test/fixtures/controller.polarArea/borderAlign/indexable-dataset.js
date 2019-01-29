module.exports = {
	config: {
		type: 'polarArea',
		data: {
			labels: [0, 1, 2, 3, 4, 5],
			datasets: [
				{
					// option in dataset
					data: [0, 2, 4, null, 6, 8],
					borderAlign: [
						'center',
						'inner',
						'center',
						'inner',
						'center',
						'inner',
					],
					borderColor: '#00ff00'
				},
			]
		},
		options: {
			legend: false,
			title: false,
			elements: {
				arc: {
					backgroundColor: 'transparent',
					borderColor: '#ff0000',
					borderWidth: 5,
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

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
			elements: {
				arc: {
					backgroundColor: 'transparent',
					borderColor: [
						'#ff88ff',
						'#888888',
						'#ff8800',
						'#00ff88',
						'#8800ff',
						'#ffff88'
					],
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

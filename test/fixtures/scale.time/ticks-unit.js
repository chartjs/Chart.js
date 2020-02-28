module.exports = {
	threshold: 0.01,
	config: {
		type: 'line',
		data: {
			labels: ['2015-01-01T20:00:00', '2015-01-02T21:00:00'],
		},
		options: {
			scales: {
				x: {
					type: 'time',
					time: {
						unit: 'hour',
					}
				},
				y: {
					display: false
				}
			},
			legend: false
		}
	},
	options: {
		spriteText: true,
		canvas: {width: 1200, height: 200}
	}
};

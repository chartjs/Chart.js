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
					bounds: 'ticks',
					time: {
						minUnit: 'day'
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
		canvas: {width: 256, height: 128}
	}
};

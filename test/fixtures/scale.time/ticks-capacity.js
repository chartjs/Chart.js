module.exports = {
	threshold: 0.01,
	config: {
		type: 'line',
		data: {
			labels: [
				'2012-01-01', '2013-01-01', '2014-01-01', '2015-01-01',
				'2016-01-01', '2017-01-01', '2018-01-01', '2019-01-01'
			]
		},
		options: {
			scales: {
				x: {
					type: 'time',
					time: {
						unit: 'year'
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
		spriteText: true
	}
};

module.exports = {
	threshold: 0.01,
	config: {
		type: 'line',
		data: {
			labels: ['foo', 'bar'],
			datasets: [{
				data: [0, 1],
				fill: false
			}],
		},
		options: {
			scales: {
				x: {
					type: 'time',
					position: 'bottom',
					time: {
						unit: 'day',
						round: true,
						parser: function(label) {
							return label === 'foo' ?
								moment('2000/01/02', 'YYYY/MM/DD') :
								moment('2016/05/08', 'YYYY/MM/DD');
						}
					},
					ticks: {
						source: 'labels'
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

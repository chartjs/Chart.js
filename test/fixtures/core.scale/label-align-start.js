module.exports = {
	config: {
		type: 'line',
		data: {
			datasets: [{
				data: [1, 2, 3],
			}],
			labels: ['Label1', 'Label2', 'Label3']
		},
		options: {
			legend: false,
			title: false,
			scales: {
				x: {
					ticks: {
						alignment: 'start',
					},
				},
				y: {
					ticks: {
						alignment: 'start',
					}
				}
			}
		}
	},
	options: {
		spriteText: true,
		canvas: {
			height: 256,
			width: 512
		}
	}
};

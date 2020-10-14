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
						align: 'center',
					},
				},
				y: {
					ticks: {
						align: 'center',
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

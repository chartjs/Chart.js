module.exports = {
	config: {
		type: 'bar',
		data: {
			datasets: [{
				data: [1, 2, 3],
			}],
			labels: [['Label1', 'line 2', 'line3'], 'Label2', 'Label3']
		},
		options: {
			legend: false,
			title: false,
			scales: {
				x: {
					ticks: {
						crossAlign: 'far',
					},
				},
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

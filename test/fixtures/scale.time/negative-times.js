module.exports = {
	threshold: 0.01,
	config: {
		type: 'line',
		data: {
			datasets: [{
				data: [
					{x: -1000000, y: 1},
					{x: 1000000000, y: 2}
				]
			}]
		},
		options: {
			scales: {
				x: {
					type: 'time',
					time: {
						unit: 'day'
					}
				},
				y: {
					ticks: {
						display: false
					}
				}
			},
			legend: false
		}
	},
	options: {
		spriteText: true,
		canvas: {width: 1000, height: 200}
	}
};

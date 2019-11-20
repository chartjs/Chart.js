module.exports = {
	config: {
		type: 'line',
		data: {
			labels: [0, 5, 10, 15, 20, 25, 30, 50, 55, 60],
			datasets: [{
				data: [6, 11, 10, 10, 3, 22, 7, 24],
				type: 'bubble',
				label: 'test',
				borderColor: '#3e95cd',
				fill: false
			}]
		},
		options: {
			legend: false,
			scales: {
				x: {ticks: {display: false}},
				y: {
					min: 8,
					max: 25,
					beginAtZero: true,
					ticks: {
						display: false
					}
				}
			}
		}
	},
	options: {
		canvas: {
			height: 256,
			width: 256
		}
	}
};

module.exports = {
	threshold: 0.01,
	config: {
		type: 'horizontalBar',
		data: {
			datasets: [{
				data: [10, 5, 0, 25, 78]
			}],
			labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick5']
		},
		options: {
			legend: false,
			title: false,
			elements: {
				rectangle: {
					backgroundColor: '#AAAAAA80',
					borderColor: '#80808080',
					borderWidth: {bottom: 6, left: 15, top: 6, right: 15}
				}
			},
			scales: {
				x: {display: false},
				y: {display: true}
			}
		}
	},
	options: {
		spriteText: true
	}
};

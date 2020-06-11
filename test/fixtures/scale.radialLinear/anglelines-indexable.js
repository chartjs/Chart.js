module.exports = {
	config: {
		type: 'radar',
		data: {
			labels: ['A', 'B', 'C', 'D', 'E']
		},
		options: {
			responsive: false,
			legend: false,
			title: false,
			scale: {
				gridLines: {
					display: true,
				},
				angleLines: {
					color: ['red', 'green'],
					lineWidth: [1, 5]
				},
				pointLabels: {
					display: false
				},
				ticks: {
					display: false
				}
			}
		}
	}
};

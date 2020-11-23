module.exports = {
	config: {
		type: 'radar',
		data: {
			labels: ['A', 'B', 'C', 'D', 'E']
		},
		options: {
			responsive: false,
			scale: {
				gridLines: {
					display: true,
					color: function(context) {
						return context.index % 2 === 0 ? 'red' : 'green';
					},
					lineWidth: function(context) {
						return context.index % 2 === 0 ? 1 : 5;
					},
				},
				angleLines: {
					color: 'rgba(255, 255, 255, 0.5)',
					lineWidth: 2
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

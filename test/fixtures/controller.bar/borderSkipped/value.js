module.exports = {
	config: {
		type: 'bar',
		data: {
			labels: [0, 1, 2, 3],
			datasets: [
				{
					// option in dataset
					data: [0, 5, -10, null],
					borderSkipped: 'top'
				},
				{
					// option in dataset
					data: [0, 5, -10, null],
					borderSkipped: 'right'
				},
				{
					// option in dataset
					data: [0, 5, -10, null],
					borderSkipped: 'bottom'
				},
				{
					// option in element (fallback)
					data: [0, 5, -10, null],
				},
				{
					// option in dataset
					data: [0, 5, -10, null],
					borderSkipped: false
				}
			]
		},
		options: {
			legend: false,
			title: false,
			elements: {
				bar: {
					backgroundColor: 'transparent',
					borderColor: '#888',
					borderSkipped: 'left',
					borderWidth: 8
				}
			},
			scales: {
				x: {display: false},
				y: {display: false}
			}
		}
	},
	options: {
		canvas: {
			height: 256,
			width: 512
		}
	}
};

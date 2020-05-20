module.exports = {
	config: {
		type: 'bar',
		data: {
			labels: ['a', 'b', 'c'],
			datasets: [
				{
					data: {a: 10, b: 2, c: -5},
					backgroundColor: '#ff0000'
				},
				{
					data: {a: 8, b: 12, c: 5},
					backgroundColor: '#00ff00'
				}
			]
		},
		options: {
			legend: false,
			title: false,
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

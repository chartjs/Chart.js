module.exports = {
	config: {
		type: 'line',
		data: {
			labels: [0, 1, 3, 4],
			datasets: [
				{
					data2: [5, 20, 10, 11],
					dataKey: 'data2',
					borderColor: '#ff0000',
					borderWidth: 2,
					fill: false,
				}
			]
		},
		options: {
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

module.exports = {
	config: {
		type: 'bar',
		data: {
			labels: ['a', 'b', 'c'],
			datasets: [
				{
					data: [{x: 'b', y: [2, 8]}, {x: 'c', y: [2, 5]}],
					backgroundColor: '#ff0000'
				},
				{
					data: [{x: 'a', y: 10}, {x: 'c', y: [6, 10]}],
					backgroundColor: '#00ff00'
				}
			]
		},
		options: {
			legend: false,
			title: false,
			scales: {
				xAxes: [{display: false, stacked: true}],
				yAxes: [{display: false, min: 0}]
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

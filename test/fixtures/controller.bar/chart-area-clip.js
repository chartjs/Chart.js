module.exports = {
	config: {
		type: 'bar',
		data: {
			labels: [0, 1, 3, 4],
			datasets: [
				{
					data: [5, 20, -5, -20],
					borderColor: '#ff0000'
				}
			]
		},
		options: {
			legend: false,
			title: false,
			layout: {
				padding: {
					left: 0,
					right: 0,
					top: 50,
					bottom: 50
				}
			},
			elements: {
				rectangle: {
					backgroundColor: '#00ff00',
					borderWidth: 8
				}
			},
			scales: {
				xAxes: [{display: false}],
				yAxes: [{display: false, ticks: {min: -10, max: 10}}]
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

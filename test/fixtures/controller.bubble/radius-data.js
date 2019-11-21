module.exports = {
	config: {
		type: 'bubble',
		data: {
			datasets: [{
				data: [
					{x: 0, y: 5, r: 1},
					{x: 1, y: 4, r: 2},
					{x: 2, y: 3, r: 6},
					{x: 3, y: 2},
					{x: 4, y: 1, r: 2},
					{x: 5, y: 0, r: NaN},
					{x: 6, y: -1, r: undefined},
					{x: 7, y: -2, r: null},
					{x: 8, y: -3, r: '4'},
					{x: 9, y: -4, r: '4px'},
				]
			}]
		},
		options: {
			legend: false,
			title: false,
			scales: {
				x: {display: false},
				y: {display: false}
			},
			elements: {
				point: {
					backgroundColor: '#444',
					radius: 10
				}
			},
			layout: {
				padding: {
					left: 24,
					right: 24
				}
			}
		}
	},
	options: {
		canvas: {
			height: 128,
			width: 256
		}
	}
};

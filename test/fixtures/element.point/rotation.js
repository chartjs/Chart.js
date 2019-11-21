var gradient;

var datasets = ['circle', 'cross', 'crossRot', 'dash', 'line', 'rect', 'rectRounded', 'rectRot', 'star', 'triangle'].map(function(style, y) {
	return {
		pointStyle: style,
		data: Array.apply(null, Array(17)).map(function(v, x) {
			return {x: x, y: 10 - y};
		})
	};
});

var angles = Array.apply(null, Array(17)).map(function(v, i) {
	return -180 + i * 22.5;
});

module.exports = {
	config: {
		type: 'bubble',
		data: {
			datasets: datasets
		},
		options: {
			responsive: false,
			legend: false,
			title: false,
			elements: {
				point: {
					rotation: angles,
					radius: 10,
					backgroundColor: function(context) {
						if (!gradient) {
							gradient = context.chart.ctx.createLinearGradient(0, 0, 512, 256);
							gradient.addColorStop(0, '#ff0000');
							gradient.addColorStop(1, '#0000ff');
						}
						return gradient;
					},
					borderColor: '#cccccc'
				}
			},
			layout: {
				padding: 20
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

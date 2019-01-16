var patternCanvas = document.createElement('canvas');
var patternContext = patternCanvas.getContext('2d');

patternCanvas.width = 6;
patternCanvas.height = 6;
patternContext.fillStyle = '#ff0000';
patternContext.fillRect(0, 0, 6, 6);
patternContext.fillStyle = '#ffff00';
patternContext.fillRect(0, 0, 4, 4);

var pattern = patternContext.createPattern(patternCanvas, 'repeat');

var gradient;

module.exports = {
	config: {
		type: 'line',
		data: {
			datasets: [{
				data: [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8],
				pointBorderColor: '#ff0000',
				pointBackgroundColor: '#00ff00',
				showLine: false
			}, {
				label: '',
				data: [4, 4, 4, 4, 4, 5, 3, 4, 4, 4, 4],
				pointBorderColor: pattern,
				pointBackgroundColor: pattern,
				showLine: false
			}, {
				label: '',
				data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				showLine: false
			}],
			labels: ['', '', '', '', '', '', '', '', '', '', '']
		},
		options: {
			legend: false,
			title: false,
			scales: {
				xAxes: [{display: false}],
				yAxes: [{display: false}]
			},
			elements: {
				line: {
					fill: false
				}
			},
			tooltips: {
				mode: 'nearest',
				intersect: false,
				callbacks: {
					label: function() {
						return '\u200b';
					}
				}
			},
			layout: {
				padding: 15
			}
		},
		plugins: [{
			beforeDatasetsUpdate: function(chart) {
				if (!gradient) {
					gradient = chart.ctx.createLinearGradient(0, 0, 512, 256);
					gradient.addColorStop(0, '#ff0000');
					gradient.addColorStop(1, '#0000ff');
				}
				chart.config.data.datasets[2].pointBorderColor = gradient;
				chart.config.data.datasets[2].pointBackgroundColor = gradient;

				return true;
			},
			afterDraw: function(chart) {
				var canvas = chart.canvas;
				var rect = canvas.getBoundingClientRect();
				var point, event;

				for (var i = 0; i < 3; ++i) {
					for (var j = 0; j < 11; ++j) {
						point = chart.getDatasetMeta(i).data[j];
						event = {
							type: 'mousemove',
							target: canvas,
							clientX: rect.left + point._model.x,
							clientY: rect.top + point._model.y
						};
						chart.handleEvent(event);
						chart.tooltip.handleEvent(event);
						chart.tooltip.transition(1);
						chart.tooltip._view.opacity = j / 10;
						chart.tooltip.draw();
					}
				}
			}
		}]
	},
	options: {
		canvas: {
			height: 256,
			width: 512
		}
	}
};

var imageCanvas = document.createElement('canvas');
var imageContext = imageCanvas.getContext('2d');

imageCanvas.width = 40;
imageCanvas.height = 40;

imageContext.fillStyle = '#f00';
imageContext.beginPath();
imageContext.moveTo(20, 0);
imageContext.lineTo(10, 40);
imageContext.lineTo(20, 30);
imageContext.closePath();
imageContext.fill();

imageContext.fillStyle = '#a00';
imageContext.beginPath();
imageContext.moveTo(20, 0);
imageContext.lineTo(30, 40);
imageContext.lineTo(20, 30);
imageContext.closePath();
imageContext.fill();

module.exports = {
	config: {
		type: 'line',
		data: {
			labels: [0, 1, 2, 3, 4, 5, 6, 7],
			datasets: [{
				data: [0, 0, 0, 0, 0, 0, 0, 0],
				showLine: false
			}]
		},
		options: {
			responsive: false,
			legend: false,
			title: false,
			elements: {
				point: {
					pointStyle: imageCanvas,
					rotation: [0, 45, 90, 135, 180, 225, 270, 315]
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

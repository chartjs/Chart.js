<!doctype html>
<html>
<head>
<title> Animation Callbacks </title>
	<script src="../../dist/Chart.min.js"></script>
	<script src="../utils.js"></script>
	<style>
		canvas {
			-moz-user-select: none;
			-webkit-user-select: none;
			-ms-user-select: none;
		}
	</style>
</head>

<body>
	<div style="width: 75%;">
		<canvas id="canvas"></canvas>
		<progress id="animationProgress" max="1" value="0" style="width: 100%"></progress>
	</div>
	<br>
	<br>
	<button id="randomizeData">Randomize Data</button>
	<script>
		var progress = document.getElementById('animationProgress');
		var config = {
			type: 'line',
			data: {
				labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
				datasets: [{
					label: 'My First dataset',
					fill: false,
					borderColor: window.chartColors.red,
					backgroundColor: window.chartColors.red,
					data: [
						randomScalingFactor(),
						randomScalingFactor(),
						randomScalingFactor(),
						randomScalingFactor(),
						randomScalingFactor(),
						randomScalingFactor(),
						randomScalingFactor()
					]
				}, {
					label: 'My Second dataset ',
					fill: false,
					borderColor: window.chartColors.blue,
					backgroundColor: window.chartColors.blue,
					data: [
						randomScalingFactor(),
						randomScalingFactor(),
						randomScalingFactor(),
						randomScalingFactor(),
						randomScalingFactor(),
						randomScalingFactor(),
						randomScalingFactor()
					]
				}]
			},
			options: {
				title: {
					display: true,
					text: 'Chart.js Line Chart - Animation Progress Bar'
				},
				animation: {
					duration: 2000,
					onProgress: function(animation) {
						progress.value = animation.currentStep / animation.numSteps;
					},
					onComplete: function() {
						window.setTimeout(function() {
							progress.value = 0;
						}, 2000);
					}
				}
			}
		};

		window.onload = function() {
			var ctx = document.getElementById('canvas').getContext('2d');
			window.myLine = new Chart(ctx, config);
		};

		document.getElementById('randomizeData').addEventListener('click', function() {
			config.data.datasets.forEach(function(dataset) {
				dataset.data = dataset.data.map(function() {
					return randomScalingFactor();
				});
			});

			window.myLine.update();
		});
	</script>
</body>

</html>

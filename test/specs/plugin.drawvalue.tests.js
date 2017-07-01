describe('Datalabels block tests', function() {
	it('Should have the correct default config', function() {
		expect(Chart.defaults.global.plugins.datalabels).toEqual({
			formatter: {
				fontWeight: 'normal',
				fontColor: '#000',
				fontSize: 10
			},
			padding: {top: 0, left: 0}
		});
	});
	it('should be constructed', function() {
		var chart = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [
					{data: []},
					{
						drawLabel: true,
						data: []
					}
				],
				labels: []
			}
		});
		var meta = chart.data.datasets[1];
		expect(meta.drawLabel).toEqual(true);
		meta = chart.data.datasets[0];
		expect(meta.drawLabel).not.toBe(true);
	});
});
// it should draw value only for the dataset with drawLabel = true
// for bar, the position should be on top
// value for scatter should be printing nicely

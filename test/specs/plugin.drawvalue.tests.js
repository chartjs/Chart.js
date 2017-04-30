describe('DrawLabel block tests', function() {
	it('Should have the correct default config', function() {
		expect(Chart.defaults.global.valueLabel).toEqual({
			fontWeight: 'normal',
			fontColor: '#000',
			fontSize: 10,
			padding: {top: 0, left: 0}
		});
	});
	it('should be constructed', function() {
		var chart = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [
					{data: []},
					{drawValue:true,data: []}
				],
				labels: []
			}
		});

		var meta = chart.data.datasets[1];
		expect(meta.drawValue).toEqual(true);
		var meta = chart.data.datasets[0];
		expect(meta.drawValue).not.toBe(true);
		
	});
})
// it should draw value only for the dataset with drawValue = true
// for bar, the position should be on top
// value for scatter should be printing nicely

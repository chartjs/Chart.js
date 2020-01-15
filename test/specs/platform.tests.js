describe('Chart.platform', function() {
	it('the default platform is dom', function() {
		expect(Chart.platform.current.type).toEqual('dom');
	});

	it('the platform can be changed to basic', function() {
		const basicPlatform = Chart.platform.availablePlatforms.find((p) => p.type === 'basic');
		expect(Chart.platform.current.type).toEqual('dom');

		Chart.platform.setPlatform(basicPlatform);
		expect(Chart.platform.current.type).toEqual('basic');

		// Reset to dom to clean up the test.
		const domPlatform = Chart.platform.availablePlatforms.find((p) => p.type === 'dom');
		Chart.platform.setPlatform(domPlatform);
	});
});

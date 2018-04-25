describe('Chart namespace', function() {
	describe('Chart', function() {
		it('should a function (constructor)', function() {
			expect(Chart instanceof Function).toBeTruthy();
		});
		it('should define "core" properties', function() {
			expect(Chart instanceof Function).toBeTruthy();
			expect(Chart.Animation instanceof Object).toBeTruthy();
			expect(Chart.animationService instanceof Object).toBeTruthy();
			expect(Chart.defaults instanceof Object).toBeTruthy();
			expect(Chart.Element instanceof Object).toBeTruthy();
			expect(Chart.Interaction instanceof Object).toBeTruthy();
			expect(Chart.layouts instanceof Object).toBeTruthy();
			expect(Chart.plugins instanceof Object).toBeTruthy();
			expect(Chart.platform instanceof Object).toBeTruthy();
			expect(Chart.Scale instanceof Object).toBeTruthy();
			expect(Chart.scaleService instanceof Object).toBeTruthy();
			expect(Chart.Ticks instanceof Object).toBeTruthy();
			expect(Chart.Tooltip instanceof Object).toBeTruthy();
			expect(Chart.Tooltip.positioners instanceof Object).toBeTruthy();
		});
	});

	describe('Chart.elements', function() {
		it('should be an object', function() {
			expect(Chart.elements instanceof Object).toBeTruthy();
		});
		it('should contains "elements" classes', function() {
			expect(Chart.elements.Arc instanceof Function).toBeTruthy();
			expect(Chart.elements.Line instanceof Function).toBeTruthy();
			expect(Chart.elements.Point instanceof Function).toBeTruthy();
			expect(Chart.elements.Rectangle instanceof Function).toBeTruthy();
		});
	});

	describe('Chart.helpers', function() {
		it('should be an object', function() {
			expect(Chart.helpers instanceof Object).toBeTruthy();
		});
		it('should contains "helpers" namespaces', function() {
			expect(Chart.helpers.easing instanceof Object).toBeTruthy();
			expect(Chart.helpers.canvas instanceof Object).toBeTruthy();
			expect(Chart.helpers.options instanceof Object).toBeTruthy();
		});
	});
});

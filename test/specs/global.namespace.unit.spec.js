describe('Chart namespace', function() {
  describe('Chart', function() {
    it('should a function (constructor)', function() {
      expect(Chart instanceof Function).toBeTruthy();
    });
    it('should define "core" properties', function() {
      expect(Chart instanceof Function).toBeTruthy();
      expect(Chart.Animation instanceof Object).toBeTruthy();
      expect(Chart.Animations instanceof Object).toBeTruthy();
      expect(Chart.defaults instanceof Object).toBeTruthy();
      expect(Chart.Element instanceof Object).toBeTruthy();
      expect(Chart.Interaction instanceof Object).toBeTruthy();
      expect(Chart.layouts instanceof Object).toBeTruthy();

      expect(Chart.platforms.BasePlatform instanceof Function).toBeTruthy();
      expect(Chart.platforms.BasicPlatform instanceof Function).toBeTruthy();
      expect(Chart.platforms.DomPlatform instanceof Function).toBeTruthy();

      expect(Chart.registry instanceof Object).toBeTruthy();
      expect(Chart.Scale instanceof Object).toBeTruthy();
      expect(Chart.Ticks instanceof Object).toBeTruthy();
    });
  });

  describe('Chart.elements', function() {
    it('should contains "elements" classes', function() {
      expect(Chart.elements.ArcElement instanceof Function).toBeTruthy();
      expect(Chart.elements.BarElement instanceof Function).toBeTruthy();
      expect(Chart.elements.LineElement instanceof Function).toBeTruthy();
      expect(Chart.elements.PointElement instanceof Function).toBeTruthy();
    });
  });

  describe('Chart.helpers', function() {
    it('should be an object', function() {
      expect(Chart.helpers instanceof Object).toBeTruthy();
    });
  });
});

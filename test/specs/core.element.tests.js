describe('Chart.element', function() {
  describe('getProps', function() {
    it('should return requested properties', function() {
      const elem = new Chart.Element();
      elem.x = 10;
      elem.y = 1.5;

      expect(elem.getProps(['x', 'y'])).toEqual(jasmine.objectContaining({x: 10, y: 1.5}));
      expect(elem.getProps(['x', 'y'], true)).toEqual(jasmine.objectContaining({x: 10, y: 1.5}));

      elem.$animations = {x: {active: () => true, _to: 20}};
      expect(elem.getProps(['x', 'y'])).toEqual(jasmine.objectContaining({x: 10, y: 1.5}));
      expect(elem.getProps(['x', 'y'], true)).toEqual(jasmine.objectContaining({x: 20, y: 1.5}));
    });
  });
});

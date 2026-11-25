describe('Chart.defaults', function() {
  describe('.set', function() {
    it('Should set defaults directly to root when scope is not provided', function() {
      expect(Chart.defaults.test).toBeUndefined();
      Chart.defaults.set({test: true});
      expect(Chart.defaults.test).toEqual(true);
      delete Chart.defaults.test;
    });

    it('Should create scope when it does not exist', function() {
      expect(Chart.defaults.test).toBeUndefined();
      Chart.defaults.set('test', {value: true});
      expect(Chart.defaults.test.value).toEqual(true);
      delete Chart.defaults.test;
    });
  });

  describe('.route', function() {
    it('Should read the source, but not change it', function() {
      expect(Chart.defaults.testscope).toBeUndefined();

      Chart.defaults.set('testscope', {test: true});
      Chart.defaults.route('testscope', 'test2', 'testscope', 'test');

      expect(Chart.defaults.testscope.test).toEqual(true);
      expect(Chart.defaults.testscope.test2).toEqual(true);

      Chart.defaults.set('testscope', {test2: false});
      expect(Chart.defaults.testscope.test).toEqual(true);
      expect(Chart.defaults.testscope.test2).toEqual(false);

      Chart.defaults.set('testscope', {test2: undefined});
      expect(Chart.defaults.testscope.test2).toEqual(true);

      delete Chart.defaults.testscope;
    });
  });
});

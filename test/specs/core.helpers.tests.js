describe('Core helper tests', function() {

  var helpers;

  beforeAll(function() {
    helpers = window.Chart.helpers;
  });

  it('should generate integer ids', function() {
    var uid = helpers.uid();
    expect(uid).toEqual(jasmine.any(Number));
    expect(helpers.uid()).toBe(uid + 1);
    expect(helpers.uid()).toBe(uid + 2);
    expect(helpers.uid()).toBe(uid + 3);
  });

  describe('clone', function() {
    it('should not allow prototype pollution', function() {
      const test = helpers.clone(JSON.parse('{"__proto__":{"polluted": true}}'));
      expect(test.prototype).toBeUndefined();
      expect(Object.prototype.polluted).toBeUndefined();
    });
  });
});

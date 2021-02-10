describe('Chart.Animation', function() {
  it('should animate boolean', function() {
    const target = {prop: false};
    const anim = new Chart.Animation({duration: 1000}, target, 'prop', true);
    expect(anim.active()).toBeTrue();

    anim.tick(anim._start + 500);
    expect(anim.active()).toBeTrue();
    expect(target.prop).toBeFalse();

    anim.tick(anim._start + 501);
    expect(anim.active()).toBeTrue();
    expect(target.prop).toBeTrue();

    anim.tick(anim._start - 100);
    expect(anim.active()).toBeTrue();
    expect(target.prop).toBeFalse();

    anim.tick(anim._start + 1000);
    expect(anim.active()).toBeFalse();
    expect(target.prop).toBeTrue();
  });

  describe('color', function() {
    it('should fall back to transparent', function() {
      const target = {};
      const anim = new Chart.Animation({duration: 1000, type: 'color'}, target, 'color', 'red');
      anim._from = undefined;
      anim.tick(anim._start + 500);
      expect(target.color).toEqual('#FF000080');

      anim._from = 'blue';
      anim._to = undefined;
      anim.tick(anim._start + 500);
      expect(target.color).toEqual('#0000FF80');
    });

    it('should not try to mix invalid color', function() {
      const target = {color: 'blue'};
      const anim = new Chart.Animation({duration: 1000, type: 'color'}, target, 'color', 'invalid');
      anim.tick(anim._start + 500);
      expect(target.color).toEqual('invalid');
    });
  });

  it('should loop', function() {
    const target = {value: 0};
    const anim = new Chart.Animation({duration: 100, loop: true}, target, 'value', 10);
    anim.tick(anim._start + 50);
    expect(target.value).toEqual(5);
    anim.tick(anim._start + 100);
    expect(target.value).toEqual(10);
    anim.tick(anim._start + 150);
    expect(target.value).toEqual(5);
    anim.tick(anim._start + 400);
    expect(target.value).toEqual(0);
  });

  it('should update', function() {
    const target = {testColor: 'transparent'};
    const anim = new Chart.Animation({duration: 100, type: 'color'}, target, 'testColor', 'red');

    anim.tick(anim._start + 50);
    expect(target.testColor).toEqual('#FF000080');

    anim.update({duration: 500}, 'blue', Date.now());
    anim.tick(anim._start + 250);
    expect(target.testColor).toEqual('#4000BFBF');

    anim.tick(anim._start + 500);
    expect(target.testColor).toEqual('blue');
  });

  it('should not update when finished', function() {
    const target = {testColor: 'transparent'};
    const anim = new Chart.Animation({duration: 100, type: 'color'}, target, 'testColor', 'red');

    anim.tick(anim._start + 100);
    expect(target.testColor).toEqual('red');
    expect(anim.active()).toBeFalse();

    anim.update({duration: 500}, 'blue', Date.now());
    expect(anim._duration).toEqual(100);
    expect(anim._to).toEqual('red');
  });
});

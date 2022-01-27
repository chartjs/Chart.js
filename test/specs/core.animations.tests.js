describe('Chart.animations', function() {
  it('should override property collection with property', function() {
    const chart = {};
    const anims = new Chart.Animations(chart, {
      collection1: {
        properties: ['property1', 'property2'],
        duration: 1000
      },
      property2: {
        duration: 2000
      }
    });
    expect(anims._properties.get('property1')).toEqual(jasmine.objectContaining({duration: 1000}));
    expect(anims._properties.get('property2')).toEqual(jasmine.objectContaining({duration: 2000}));
  });

  it('should ignore duplicate definitions from collections', function() {
    const chart = {};
    const anims = new Chart.Animations(chart, {
      collection1: {
        properties: ['property1'],
        duration: 1000
      },
      collection2: {
        properties: ['property1', 'property2'],
        duration: 2000
      }
    });
    expect(anims._properties.get('property1')).toEqual(jasmine.objectContaining({duration: 1000}));
    expect(anims._properties.get('property2')).toEqual(jasmine.objectContaining({duration: 2000}));
  });

  it('should not animate undefined options key', function() {
    const chart = {};
    const anims = new Chart.Animations(chart, {value: {duration: 100}, option: {duration: 200}});
    const target = {
      value: 1,
      options: {
        option: 2
      }
    };
    expect(anims.update(target, {
      options: undefined
    })).toBeUndefined();
  });

  it('should assign options directly, if target does not have previous options', function() {
    const chart = {};
    const anims = new Chart.Animations(chart, {option: {duration: 200}});
    const target = {};
    expect(anims.update(target, {options: {option: 1}})).toBeUndefined();
  });

  it('should clone the target options, if those are shared and new options are not', function() {
    const chart = {options: {}};
    const anims = new Chart.Animations(chart, {option: {duration: 200}});
    const options = {option: 0, $shared: true};
    const target = {options};
    expect(anims.update(target, {options: {option: 1}})).toBeTrue();
    expect(target.options.$shared).not.toBeTrue();
    expect(target.options !== options).toBeTrue();
  });

  it('should assign shared options to target after animations complete', function(done) {
    const chart = {
      draw: function() {},
      options: {}
    };
    const anims = new Chart.Animations(chart, {value: {duration: 100}, option: {duration: 200}});

    const target = {
      value: 1,
      options: {
        option: 2
      }
    };
    const sharedOpts = {option: 10, $shared: true};

    expect(anims.update(target, {
      options: sharedOpts
    })).toBeTrue();

    expect(target.options !== sharedOpts).toBeTrue();

    Chart.animator.start(chart);

    setTimeout(function() {
      expect(Chart.animator.running(chart)).toBeFalse();
      expect(target.options === sharedOpts).toBeTrue();

      Chart.animator.remove(chart);
      done();
    }, 300);
  });

  it('should not assign shared options to target when animations are cancelled', function(done) {
    const chart = {
      draw: function() {},
      options: {}
    };
    const anims = new Chart.Animations(chart, {value: {duration: 100}, option: {duration: 200}});

    const target = {
      value: 1,
      options: {
        option: 2
      }
    };
    const sharedOpts = {option: 10, $shared: true};

    expect(anims.update(target, {
      options: sharedOpts
    })).toBeTrue();

    expect(target.options !== sharedOpts).toBeTrue();

    Chart.animator.start(chart);

    setTimeout(function() {
      expect(Chart.animator.running(chart)).toBeTrue();
      Chart.animator.stop(chart);
      expect(Chart.animator.running(chart)).toBeFalse();

      setTimeout(function() {
        expect(target.options === sharedOpts).toBeFalse();

        Chart.animator.remove(chart);
        done();
      }, 250);
    }, 50);
  });

  it('should assign final shared options to target after animations complete', function(done) {
    const chart = {
      draw: function() {},
      options: {}
    };
    const anims = new Chart.Animations(chart, {value: {duration: 100}, option: {duration: 200}});

    const origOpts = {option: 2};
    const target = {
      value: 1,
      options: origOpts
    };
    const sharedOpts = {option: 10, $shared: true};
    const sharedOpts2 = {option: 20, $shared: true};

    expect(anims.update(target, {
      options: sharedOpts
    })).toBeTrue();

    expect(target.options !== sharedOpts).toBeTrue();

    Chart.animator.start(chart);

    setTimeout(function() {
      expect(Chart.animator.running(chart)).toBeTrue();

      expect(target.options === origOpts).toBeTrue();

      expect(anims.update(target, {
        options: sharedOpts2
      })).toBeUndefined();

      expect(target.options === origOpts).toBeTrue();

      setTimeout(function() {
        expect(target.options === sharedOpts2).toBeTrue();

        Chart.animator.remove(chart);
        done();
      }, 250);
    }, 50);
  });
});

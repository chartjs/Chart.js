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
    expect(anims._properties.get('property1')).toEqual(expect.objectContaining({duration: 1000}));
    expect(anims._properties.get('property2')).toEqual(expect.objectContaining({duration: 2000}));
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
    expect(anims._properties.get('property1')).toEqual(expect.objectContaining({duration: 1000}));
    expect(anims._properties.get('property2')).toEqual(expect.objectContaining({duration: 2000}));
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
    expect(anims.update(target, {options: {option: 1}})).toBe(true);
    expect(target.options.$shared).not.toBe(true);
    expect(target.options !== options).toBe(true);
  });

  it('should assign shared options to target after animations complete', async function() {
    let done;
    const complete = new Promise((resolve) => {
      done = resolve;
    });
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
    })).toBe(true);

    expect(target.options !== sharedOpts).toBe(true);

    Chart.animator.start(chart);

    setTimeout(function() {
      expect(Chart.animator.running(chart)).toBe(false);
      expect(target.options === sharedOpts).toBe(true);

      Chart.animator.remove(chart);
      done();
    }, 300);
    await complete;
  });

  it('should not assign shared options to target when animations are cancelled', async function() {
    let done;
    const complete = new Promise((resolve) => {
      done = resolve;
    });
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
    })).toBe(true);

    expect(target.options !== sharedOpts).toBe(true);

    Chart.animator.start(chart);

    setTimeout(function() {
      expect(Chart.animator.running(chart)).toBe(true);
      Chart.animator.stop(chart);
      expect(Chart.animator.running(chart)).toBe(false);

      setTimeout(function() {
        expect(target.options === sharedOpts).toBe(false);

        Chart.animator.remove(chart);
        done();
      }, 250);
    }, 50);
    await complete;
  });

  it('should assign final shared options to target after animations complete', async function() {
    let done;
    const complete = new Promise((resolve) => {
      done = resolve;
    });
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
    })).toBe(true);

    expect(target.options !== sharedOpts).toBe(true);

    Chart.animator.start(chart);

    setTimeout(function() {
      expect(Chart.animator.running(chart)).toBe(true);

      expect(target.options === origOpts).toBe(true);

      expect(anims.update(target, {
        options: sharedOpts2
      })).toBeUndefined();

      expect(target.options === origOpts).toBe(true);

      setTimeout(function() {
        expect(target.options === sharedOpts2).toBe(true);

        Chart.animator.remove(chart);
        done();
      }, 250);
    }, 50);
    await complete;
  });
});

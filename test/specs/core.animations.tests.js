describe('Chart.animations', function() {
  it('should preserve a non-animated update across rendered animation frames', function(done) {
    const chart = acquireChart({
      type: 'line',
      data: {datasets: [{data: [2]}]},
      options: {animation: {duration: 100}, scales: {y: {min: 0, max: 10}}}
    });
    chart.stop();
    chart.data.datasets[0].data[0] = 8;
    chart.update();
    chart.data.datasets[0].data[0] = 4;
    chart.update('none');
    setTimeout(function() {
      expect(chart.getDatasetMeta(0).data[0].y).toBeCloseTo(chart.scales.y.getPixelForValue(4), 6);
      done();
    }, 200);
  });

  ['line', 'scatter', 'bar'].forEach(function(type) {
    it('should preserve a non-animated ' + type + ' update during an animation', function() {
      const chart = acquireChart({
        type,
        data: {datasets: [{data: [{x: 1, y: 2}]}]},
        options: {
          animation: {duration: 1000},
          scales: {x: {type: 'linear', min: 0, max: 2}, y: {min: 0, max: 10}}
        }
      });
      chart.stop();
      chart.data.datasets[0].data[0].y = 8;
      chart.update();
      const point = chart.getDatasetMeta(0).data[0];
      const animation = point.$animations.y;
      expect(animation.active()).toBeTrue();

      chart.data.datasets[0].data[0].y = 4;
      chart.update('none');
      const expected = chart.scales.y.getPixelForValue(4);
      expect(point.y).toBeCloseTo(expected, 6);
      if (animation.active()) {
        animation.tick(Date.now() + 2000);
      }
      expect(point.y).toBeCloseTo(expected, 6);
      expect(animation.active()).toBeFalse();
    });
  });

  it('should only cancel animations for datasets updated with none', function() {
    const chart = acquireChart({
      type: 'line',
      data: {datasets: [{data: [2]}, {data: [3]}]},
      options: {animation: {duration: 1000}, scales: {y: {min: 0, max: 10}}}
    });
    chart.stop();
    chart.data.datasets[0].data[0] = 8;
    chart.data.datasets[1].data[0] = 9;
    chart.update();
    const first = chart.getDatasetMeta(0).data[0];
    const second = chart.getDatasetMeta(1).data[0];
    chart.data.datasets[0].data[0] = 4;
    chart.update(function(context) {
      return context.datasetIndex === 0 ? 'none' : 'default';
    });
    expect(first.$animations.y.active()).toBeFalse();
    expect(first.y).toBeCloseTo(chart.scales.y.getPixelForValue(4), 6);
    expect(second.$animations.y.active()).toBeTrue();
  });

  it('should cancel shared option animations before a non-animated update', function() {
    const chart = acquireChart({
      type: 'line',
      data: {datasets: [{data: [2, 3], pointRadius: 3}]},
      options: {animation: {duration: 1000}}
    });
    chart.stop();
    chart.data.datasets[0].pointRadius = 10;
    chart.update();
    const controller = chart.getDatasetMeta(0).controller;
    const animation = controller._sharedOptions.$animations.radius;
    expect(animation.active()).toBeTrue();
    chart.data.datasets[0].pointRadius = 5;
    chart.update('none');
    expect(animation.active()).toBeFalse();
    for (const point of chart.getDatasetMeta(0).data) {
      expect(point.options.radius).toBe(5);
    }
  });

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

describe('DOM helpers tests', function() {
  let helpers;

  beforeAll(function() {
    helpers = window.Chart.helpers;
  });

  it ('should get the maximum size for a node', function() {
    // Create div with fixed size as a test bed
    var div = document.createElement('div');
    div.style.width = '200px';
    div.style.height = '300px';

    document.body.appendChild(div);

    // Create the div we want to get the max size for
    var innerDiv = document.createElement('div');
    div.appendChild(innerDiv);

    expect(helpers.getMaximumSize(innerDiv)).toEqual(jasmine.objectContaining({width: 200, height: 300}));

    document.body.removeChild(div);
  });

  it ('should get the maximum width and height for a node in a ShadowRoot', function() {
    // Create div with fixed size as a test bed
    var div = document.createElement('div');
    div.style.width = '200px';
    div.style.height = '300px';

    document.body.appendChild(div);

    if (!div.attachShadow) {
      // Shadow DOM is not natively supported
      return;
    }

    var shadow = div.attachShadow({mode: 'closed'});

    // Create the div we want to get the max size for
    var innerDiv = document.createElement('div');
    shadow.appendChild(innerDiv);

    expect(helpers.getMaximumSize(innerDiv)).toEqual(jasmine.objectContaining({width: 200, height: 300}));

    document.body.removeChild(div);
  });

  it ('should get the maximum width of a node that has a max-width style', function() {
    // Create div with fixed size as a test bed
    var div = document.createElement('div');
    div.style.width = '200px';
    div.style.height = '300px';

    document.body.appendChild(div);

    // Create the div we want to get the max size for and set a max-width style
    var innerDiv = document.createElement('div');
    innerDiv.style.maxWidth = '150px';
    div.appendChild(innerDiv);

    expect(helpers.getMaximumSize(innerDiv)).toEqual(jasmine.objectContaining({width: 150}));

    document.body.removeChild(div);
  });

  it ('should get the maximum height of a node that has a max-height style', function() {
    // Create div with fixed size as a test bed
    var div = document.createElement('div');
    div.style.width = '200px';
    div.style.height = '300px';

    document.body.appendChild(div);

    // Create the div we want to get the max size for and set a max-height style
    var innerDiv = document.createElement('div');
    innerDiv.style.maxHeight = '150px';
    div.appendChild(innerDiv);

    expect(helpers.getMaximumSize(innerDiv)).toEqual(jasmine.objectContaining({height: 150}));

    document.body.removeChild(div);
  });

  it ('should get the maximum width of a node when the parent has a max-width style', function() {
    // Create div with fixed size as a test bed
    var div = document.createElement('div');
    div.style.width = '200px';
    div.style.height = '300px';

    document.body.appendChild(div);

    // Create an inner wrapper around our div we want to size and give that a max-width style
    var parentDiv = document.createElement('div');
    parentDiv.style.maxWidth = '150px';
    div.appendChild(parentDiv);

    // Create the div we want to get the max size for
    var innerDiv = document.createElement('div');
    parentDiv.appendChild(innerDiv);

    expect(helpers.getMaximumSize(innerDiv)).toEqual(jasmine.objectContaining({width: 150}));

    document.body.removeChild(div);
  });

  it ('should get the maximum height of a node when the parent has a max-height style', function() {
    // Create div with fixed size as a test bed
    var div = document.createElement('div');
    div.style.width = '200px';
    div.style.height = '300px';

    document.body.appendChild(div);

    // Create an inner wrapper around our div we want to size and give that a max-height style
    var parentDiv = document.createElement('div');
    parentDiv.style.maxHeight = '150px';
    div.appendChild(parentDiv);

    // Create the div we want to get the max size for
    var innerDiv = document.createElement('div');
    innerDiv.style.height = '300px'; // make it large
    parentDiv.appendChild(innerDiv);

    expect(helpers.getMaximumSize(innerDiv)).toEqual(jasmine.objectContaining({height: 150}));

    document.body.removeChild(div);
  });

  it ('should get the maximum width of a node that has a percentage max-width style', function() {
    // Create div with fixed size as a test bed
    var div = document.createElement('div');
    div.style.width = '200px';
    div.style.height = '300px';

    document.body.appendChild(div);

    // Create the div we want to get the max size for and set a max-width style
    var innerDiv = document.createElement('div');
    innerDiv.style.maxWidth = '50%';
    div.appendChild(innerDiv);

    expect(helpers.getMaximumSize(innerDiv)).toEqual(jasmine.objectContaining({width: 100}));

    document.body.removeChild(div);
  });

  it('should get the maximum height of a node that has a percentage max-height style', function() {
    // Create div with fixed size as a test bed
    var div = document.createElement('div');
    div.style.width = '200px';
    div.style.height = '300px';

    document.body.appendChild(div);

    // Create the div we want to get the max size for and set a max-height style
    var innerDiv = document.createElement('div');
    innerDiv.style.maxHeight = '50%';
    div.appendChild(innerDiv);

    expect(helpers.getMaximumSize(innerDiv)).toEqual(jasmine.objectContaining({height: 150}));

    document.body.removeChild(div);
  });

  it ('should get the maximum width of a node when the parent has a percentage max-width style', function() {
    // Create div with fixed size as a test bed
    var div = document.createElement('div');
    div.style.width = '200px';
    div.style.height = '300px';

    document.body.appendChild(div);

    // Create an inner wrapper around our div we want to size and give that a max-width style
    var parentDiv = document.createElement('div');
    parentDiv.style.maxWidth = '50%';
    div.appendChild(parentDiv);

    // Create the div we want to get the max size for
    var innerDiv = document.createElement('div');
    parentDiv.appendChild(innerDiv);

    expect(helpers.getMaximumSize(innerDiv)).toEqual(jasmine.objectContaining({width: 100}));

    document.body.removeChild(div);
  });

  it ('should get the maximum height of a node when the parent has a percentage max-height style', function() {
    // Create div with fixed size as a test bed
    var div = document.createElement('div');
    div.style.width = '200px';
    div.style.height = '300px';

    document.body.appendChild(div);

    // Create an inner wrapper around our div we want to size and give that a max-height style
    var parentDiv = document.createElement('div');
    parentDiv.style.maxHeight = '50%';
    div.appendChild(parentDiv);

    var innerDiv = document.createElement('div');
    innerDiv.style.height = '300px'; // make it large
    parentDiv.appendChild(innerDiv);

    expect(helpers.getMaximumSize(innerDiv)).toEqual(jasmine.objectContaining({height: 150}));

    document.body.removeChild(div);
  });

  it ('Should get padding of parent as number (pixels) when defined as percent (returns incorrectly in IE11)', function() {

    // Create div with fixed size as a test bed
    var div = document.createElement('div');
    div.style.width = '300px';
    div.style.height = '300px';
    document.body.appendChild(div);

    // Inner DIV to have 5% padding of parent
    var innerDiv = document.createElement('div');

    div.appendChild(innerDiv);

    var canvas = document.createElement('canvas');
    innerDiv.appendChild(canvas);

    // No padding
    expect(helpers.getMaximumSize(canvas)).toEqual(jasmine.objectContaining({width: 300}));

    // test with percentage
    innerDiv.style.padding = '5%';
    expect(helpers.getMaximumSize(canvas)).toEqual(jasmine.objectContaining({width: 270}));

    // test with pixels
    innerDiv.style.padding = '10px';
    expect(helpers.getMaximumSize(canvas)).toEqual(jasmine.objectContaining({width: 280}));

    document.body.removeChild(div);
  });

  it ('should leave styled height and width on canvas if explicitly set', function() {
    var chart = window.acquireChart({}, {
      canvas: {
        height: 200,
        width: 200,
        style: 'height: 400px; width: 400px;'
      }
    });

    helpers.retinaScale(chart, true);

    var canvas = chart.canvas;

    expect(canvas.style.height).toBe('400px');
    expect(canvas.style.width).toBe('400px');
  });

  describe('getRelativePosition', function() {
    it('should use offsetX/Y when available', function() {
      const event = {offsetX: 50, offsetY: 100};
      const chart = window.acquireChart({}, {
        canvas: {
          height: 200,
          width: 200,
        }
      });
      expect(helpers.getRelativePosition(event, chart)).toEqual({x: 50, y: 100});

      const chart2 = window.acquireChart({}, {
        canvas: {
          height: 200,
          width: 200,
          style: 'padding: 10px'
        }
      });
      expect(helpers.getRelativePosition(event, chart2)).toEqual({
        x: Math.round((event.offsetX - 10) / 180 * 200),
        y: Math.round((event.offsetY - 10) / 180 * 200)
      });

      const chart3 = window.acquireChart({}, {
        canvas: {
          height: 200,
          width: 200,
          style: 'width: 400px, height: 400px; padding: 10px'
        }
      });
      expect(helpers.getRelativePosition(event, chart3)).toEqual({
        x: Math.round((event.offsetX - 10) / 360 * 400),
        y: Math.round((event.offsetY - 10) / 360 * 400)
      });

      const chart4 = window.acquireChart({}, {
        canvas: {
          height: 200,
          width: 200,
          style: 'width: 400px, height: 400px; padding: 10px; position: absolute; left: 20, top: 20'
        }
      });
      expect(helpers.getRelativePosition(event, chart4)).toEqual({
        x: Math.round((event.offsetX - 10) / 360 * 400),
        y: Math.round((event.offsetY - 10) / 360 * 400)
      });

    });

    it('should calculate from clientX/Y as fallback', function() {
      const chart = window.acquireChart({}, {
        canvas: {
          height: 200,
          width: 200,
        }
      });

      const event = {
        clientX: 50,
        clientY: 100
      };

      const rect = chart.canvas.getBoundingClientRect();
      const pos = helpers.getRelativePosition(event, chart);
      expect(Math.abs(pos.x - Math.round(event.clientX - rect.x))).toBeLessThanOrEqual(1);
      expect(Math.abs(pos.y - Math.round(event.clientY - rect.y))).toBeLessThanOrEqual(1);

      const chart2 = window.acquireChart({}, {
        canvas: {
          height: 200,
          width: 200,
          style: 'padding: 10px'
        }
      });
      const rect2 = chart2.canvas.getBoundingClientRect();
      const pos2 = helpers.getRelativePosition(event, chart2);
      expect(Math.abs(pos2.x - Math.round((event.clientX - rect2.x - 10) / 180 * 200))).toBeLessThanOrEqual(1);
      expect(Math.abs(pos2.y - Math.round((event.clientY - rect2.y - 10) / 180 * 200))).toBeLessThanOrEqual(1);

      const chart3 = window.acquireChart({}, {
        canvas: {
          height: 200,
          width: 200,
          style: 'width: 400px, height: 400px; padding: 10px'
        }
      });
      const rect3 = chart3.canvas.getBoundingClientRect();
      const pos3 = helpers.getRelativePosition(event, chart3);
      expect(Math.abs(pos3.x - Math.round((event.clientX - rect3.x - 10) / 360 * 400))).toBeLessThanOrEqual(1);
      expect(Math.abs(pos3.y - Math.round((event.clientY - rect3.y - 10) / 360 * 400))).toBeLessThanOrEqual(1);
    });

    it ('should get the correct relative position for a node in a ShadowRoot', function() {
      const event = {
        offsetX: 50,
        offsetY: 100,
        clientX: 50,
        clientY: 100
      };

      const chart = window.acquireChart({}, {
        canvas: {
          height: 200,
          width: 200,
        },
        useShadowDOM: true
      });

      event.target = chart.canvas.parentNode.host;
      expect(event.target.shadowRoot).not.toEqual(null);
      const rect = chart.canvas.getBoundingClientRect();
      const pos = helpers.getRelativePosition(event, chart);
      expect(Math.abs(pos.x - Math.round(event.clientX - rect.x))).toBeLessThanOrEqual(1);
      expect(Math.abs(pos.y - Math.round(event.clientY - rect.y))).toBeLessThanOrEqual(1);

      const chart2 = window.acquireChart({}, {
        canvas: {
          height: 200,
          width: 200,
          style: 'padding: 10px'
        },
        useShadowDOM: true
      });

      event.target = chart2.canvas.parentNode.host;
      const rect2 = chart2.canvas.getBoundingClientRect();
      const pos2 = helpers.getRelativePosition(event, chart2);
      expect(Math.abs(pos2.x - Math.round((event.clientX - rect2.x - 10) / 180 * 200))).toBeLessThanOrEqual(1);
      expect(Math.abs(pos2.y - Math.round((event.clientY - rect2.y - 10) / 180 * 200))).toBeLessThanOrEqual(1);

      const chart3 = window.acquireChart({}, {
        canvas: {
          height: 200,
          width: 200,
          style: 'width: 400px, height: 400px; padding: 10px'
        },
        useShadowDOM: true
      });

      event.target = chart3.canvas.parentNode.host;
      const rect3 = chart3.canvas.getBoundingClientRect();
      const pos3 = helpers.getRelativePosition(event, chart3);
      expect(Math.abs(pos3.x - Math.round((event.clientX - rect3.x - 10) / 360 * 400))).toBeLessThanOrEqual(1);
      expect(Math.abs(pos3.y - Math.round((event.clientY - rect3.y - 10) / 360 * 400))).toBeLessThanOrEqual(1);
    });

    it('Should not return NaN with a custom event', async function() {
      let dataX = null;
      let dataY = null;
      const chart = window.acquireChart(
        {
          type: 'bar',
          data: {
            datasets: [{
              data: [{x: 'first', y: 10}, {x: 'second', y: 5}, {x: 'third', y: 15}]
            }]
          },
          options: {
            onHover: (e) => {
              const canvasPosition = Chart.helpers.getRelativePosition(e, chart);

              dataX = canvasPosition.x;
              dataY = canvasPosition.y;
            }
          }
        });

      const point = chart.getDatasetMeta(0).data[1];
      await jasmine.triggerMouseEvent(chart, 'mousemove', point);

      expect(dataX).not.toEqual(NaN);
      expect(dataY).not.toEqual(NaN);
    });
  });
});

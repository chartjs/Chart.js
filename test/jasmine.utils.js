/* global __karma__ */

function loadJSON(url, callback) {
	var request = new XMLHttpRequest();
	request.onreadystatechange = function() {
		if (request.readyState === 4) {
			return callback(JSON.parse(request.responseText));
		}
	};

	request.overrideMimeType('application/json');
	request.open('GET', url, true);
	request.send(null);
}

function createCanvas(w, h) {
	var canvas = document.createElement('canvas');
	canvas.width = w;
	canvas.height = h;
	return canvas;
}

function readImageData(url, callback) {
	var image = new Image();

	image.onload = function() {
		var h = image.height;
		var w = image.width;
		var canvas = createCanvas(w, h);
		var ctx = canvas.getContext('2d');
		ctx.drawImage(image, 0, 0, w, h);
		callback(ctx.getImageData(0, 0, w, h));
	};

	image.src = url;
}

/**
 * Injects a new canvas (and div wrapper) and creates teh associated Chart instance
 * using the given config. Additional options allow tweaking elements generation.
 * @param {object} config - Chart config.
 * @param {object} options - Chart acquisition options.
 * @param {object} options.canvas - Canvas attributes.
 * @param {object} options.wrapper - Canvas wrapper attributes.
 * @param {boolean} options.persistent - If true, the chart will not be released after the spec.
 */
function acquireChart(config, options) {
	var wrapper = document.createElement('div');
	var canvas = document.createElement('canvas');
	var chart, key;

	config = config || {};
	options = options || {};
	options.canvas = options.canvas || {height: 512, width: 512};
	options.wrapper = options.wrapper || {class: 'chartjs-wrapper'};

	for (key in options.canvas) {
		if (options.canvas.hasOwnProperty(key)) {
			canvas.setAttribute(key, options.canvas[key]);
		}
	}

	for (key in options.wrapper) {
		if (options.wrapper.hasOwnProperty(key)) {
			wrapper.setAttribute(key, options.wrapper[key]);
		}
	}

	// by default, remove chart animation and auto resize
	config.options = config.options || {};
	config.options.animation = config.options.animation === undefined ? false : config.options.animation;
	config.options.responsive = config.options.responsive === undefined ? false : config.options.responsive;
	config.options.defaultFontFamily = config.options.defaultFontFamily || 'Arial';

	wrapper.appendChild(canvas);
	window.document.body.appendChild(wrapper);

	try {
		chart = new Chart(canvas.getContext('2d'), config);
	} catch (e) {
		window.document.body.removeChild(wrapper);
		throw e;
	}

	chart.$test = {
		persistent: options.persistent,
		wrapper: wrapper
	};

	return chart;
}

function releaseChart(chart) {
	chart.destroy();

	var wrapper = (chart.$test || {}).wrapper;
	if (wrapper && wrapper.parentNode) {
		wrapper.parentNode.removeChild(wrapper);
	}
}

function injectCSS(css) {
	// http://stackoverflow.com/q/3922139
	var head = document.getElementsByTagName('head')[0];
	var style = document.createElement('style');
	style.setAttribute('type', 'text/css');
	if (style.styleSheet) { // IE
		style.styleSheet.cssText = css;
	} else {
		style.appendChild(document.createTextNode(css));
	}
	head.appendChild(style);
}

function specFromFixture(description, inputs) {
	it(inputs.json, function(done) {
		loadJSON(inputs.json, function(json) {
			var chart = acquireChart(json.config, json.options);
			if (!inputs.png) {
				fail('Missing PNG comparison file for ' + inputs.json);
				if (!json.debug) {
					releaseChart(chart);
				}
				done();
			}

			readImageData(inputs.png, function(expected) {
				expect(chart).toEqualImageData(expected, json);
				releaseChart(chart);
				done();
			});
		});
	});
}

function specsFromFixtures(path) {
	var regex = new RegExp('(^/base/test/fixtures/' + path + '.+)\\.(png|json)');
	var inputs = {};

	Object.keys(__karma__.files || {}).forEach(function(file) {
		var matches = file.match(regex);
		var name = matches && matches[1];
		var type = matches && matches[2];

		if (name && type) {
			inputs[name] = inputs[name] || {};
			inputs[name][type] = file;
		}
	});

	return function() {
		Object.keys(inputs).forEach(function(key) {
			specFromFixture(key, inputs[key]);
		});
	};
}

function waitForResize(chart, callback) {
	var override = chart.resize;
	chart.resize = function() {
		chart.resize = override;
		override.apply(this, arguments);
		callback();
	};
}

function triggerMouseEvent(chart, type, el) {
	var node = chart.canvas;
	var rect = node.getBoundingClientRect();
	var event = new MouseEvent(type, {
		clientX: rect.left + el._model.x,
		clientY: rect.top + el._model.y,
		cancelable: true,
		bubbles: true,
		view: window
	});

	node.dispatchEvent(event);
}

module.exports = {
	injectCSS: injectCSS,
	createCanvas: createCanvas,
	acquireChart: acquireChart,
	releaseChart: releaseChart,
	specsFromFixtures: specsFromFixtures,
	triggerMouseEvent: triggerMouseEvent,
	waitForResize: waitForResize
};

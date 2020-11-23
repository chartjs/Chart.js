/* global __karma__ */

'use strict';

import utils from './utils';

function readFile(url, callback) {
	var request = new XMLHttpRequest();
	request.onreadystatechange = function() {
		if (request.readyState === 4) {
			return callback(request.responseText);
		}
	};

	request.open('GET', url, false);
	request.send(null);
}

function loadConfig(url, callback) {
	var regex = /\.(json|js)$/i;
	var matches = url.match(regex);
	var type = matches ? matches[1] : 'json';
	var cfg = null;

	readFile(url, function(content) {
		switch (type) {
		case 'js':
			// eslint-disable-next-line
			cfg = new Function('"use strict"; var module = {};' + content + '; return module.exports;')();
			break;
		case 'json':
			cfg = JSON.parse(content);
			break;
		default:
		}

		callback(cfg);
	});
}

function specFromFixture(description, inputs) {
	var input = inputs.js || inputs.json;
	it(input, function(done) {
		loadConfig(input, function(json) {
			var descr = json.description || (json.description = description);

			var config = json.config;
			var options = config.options || (config.options = {});

			// plugins are disabled by default, except if the path contains 'plugin' or there are instance plugins
			if (input.indexOf('plugin') === -1 && config.plugins === undefined) {
				options.plugins = options.plugins || false;
			}

			var chart = utils.acquireChart(config, json.options);
			if (!inputs.png) {
				fail(descr + '\r\nMissing PNG comparison file for ' + input);
				done();
			}

			utils.readImageData(inputs.png, function(expected) {
				expect(chart).toEqualImageData(expected, json);
				utils.releaseChart(chart);
				done();
			});
		});
	});
}

function specsFromFixtures(path) {
	var regex = new RegExp('(^/base/test/fixtures/' + path + '.+)\\.(png|json|js)');
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

export default {
	specs: specsFromFixtures
};

(function() {
	// Code from http://stackoverflow.com/questions/4406864/html-canvas-unit-testing
	var Context = function() {
		this._calls = []; // names/args of recorded calls
		this._initMethods();

		this._fillStyle = null;
		this._lineWidth = null;
		this._strokeStyle = null;

		// Define properties here so that we can record each time they are set
		Object.defineProperties(this, {
			"fillStyle": {
				'get': function() { return this._fillStyle; },
				'set': function(style) {
					this._fillStyle = style;
					this.record('setFillStyle', [style]);
				}
			},
			'lineWidth': {
				'get': function() { return this._lineWidth; },
				'set': function (width) {
					this._lineWidth = width;
					this.record('setLineWidth', [width]);
				}
			},
			'strokeStyle': {
				'get': function() { return this._strokeStyle; },
				'set': function(style) {
					this._strokeStyle = style;
					this.record('setStrokeStyle', [style]);
				}
			},
		});
	};
	
	Context.prototype._initMethods = function() {
		// define methods to test here
		// no way to introspect so we have to do some extra work :(
		var methods = {
			arc: function() {},
			beginPath: function() {},
			closePath: function() {},
			fill: function() {},
			lineTo: function(x, y) {},
			moveTo: function(x, y) {},
			stroke: function() {}
		};

		// attach methods to the class itself
		var scope = this;
		var addMethod = function(name, method) {
			scope[methodName] = function() {
				scope.record(name, arguments);
				method.apply(scope, arguments);
			};
		}

		for (var methodName in methods) {
			var method = methods[methodName];

			addMethod(methodName, method);
		}
	};

	Context.prototype.record = function(methodName, args) {
		this._calls.push({
			name: methodName,
			args: Array.prototype.slice.call(args)
		});
	},

	Context.prototype.getCalls = function() {
		return this._calls;
	}

	window.createMockContext = function() {
		return new Context();
	};
})();
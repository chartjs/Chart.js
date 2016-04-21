(function() {
	// Code from http://stackoverflow.com/questions/4406864/html-canvas-unit-testing
	var Context = function() {
		this._calls = []; // names/args of recorded calls
		this._initMethods();

		this._fillStyle = null;
		this._lineCap = null;
		this._lineDashOffset = null;
		this._lineJoin = null;
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
			'lineCap': {
				'get': function() { return this._lineCap; },
				'set': function(cap) {
					this._lineCap = cap;
					this.record('setLineCap', [cap]);
				}
			},
			'lineDashOffset': {
				'get': function() { return this._lineDashOffset; },
				'set': function(offset) {
					this._lineDashOffset = offset;
					this.record('setLineDashOffset', [offset]);
				}
			},
			'lineJoin': {
				'get': function() { return this._lineJoin; },
				'set': function(join) {
					this._lineJoin = join;
					this.record('setLineJoin', [join]);
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
			bezierCurveTo: function() {},
			clearRect: function() {},
			closePath: function() {},
			fill: function() {},
			fillRect: function() {},
			fillText: function() {},
			lineTo: function(x, y) {},
			measureText: function(text) {
				// return the number of characters * fixed size
				return text ? { width: text.length * 10 } : {width: 0};
			},
			moveTo: function(x, y) {},
			quadraticCurveTo: function() {},
			restore: function() {},
			rotate: function() {},
			save: function() {},
			setLineDash: function() {},
			stroke: function() {},
			strokeRect: function(x, y, w, h) {},
			setTransform: function(a, b, c, d, e, f) {},
			translate: function(x, y) {},
		};

		// attach methods to the class itself
		var scope = this;
		var addMethod = function(name, method) {
			scope[methodName] = function() {
				scope.record(name, arguments);
				return method.apply(scope, arguments);
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

	Context.prototype.resetCalls = function() {
		this._calls = [];
	};

	window.createMockContext = function() {
		return new Context();
	};
})();
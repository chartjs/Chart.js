(function() {
	// Code from http://stackoverflow.com/questions/4406864/html-canvas-unit-testing
	var Context = function() {
		this._calls = []; // names/args of recorded calls
		this._initMethods();
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
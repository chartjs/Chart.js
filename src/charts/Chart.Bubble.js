(function() {
	"use strict";

	var root = this;
	var Chart = root.Chart;
	var helpers = Chart.helpers;

	var defaultConfig = {
		hover: {
			mode: 'single',
		},

		scales: {
			xAxes: [{
				type: "linear", // bubble should probably use a linear scale by default
				position: "bottom",
				id: "x-axis-0", // need an ID so datasets can reference the scale
			}],
			yAxes: [{
				type: "linear",
				position: "left",
				id: "y-axis-0",
			}],
		},

		tooltips: {
			template: "(<%= value.x %>, <%= value.y %>)",
			multiTemplate: "<%if (datasetLabel){%><%=datasetLabel%>: <%}%>(<%= value.x %>, <%= value.y %>)",
		},

	};

	Chart.Bubble = function(context, config) {
		config.options = helpers.configMerge(defaultConfig, config.options);
		config.type = 'bubble';
		return new Chart(context, config);
	};

}).call(this);

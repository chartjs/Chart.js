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
				type: "linear", // scatter should not use a category axis
				position: "bottom",
				id: "x-axis-1", // need an ID so datasets can reference the scale
			}],
			yAxes: [{
				type: "linear",
				position: "left",
				id: "y-axis-1",
			}],
		},

		tooltips: {
			template: "(<%= value.x %>, <%= value.y %>)",
			multiTemplate: "<%if (datasetLabel){%><%=datasetLabel%>: <%}%>(<%= value.x %>, <%= value.y %>)",
		},

	};

	Chart.Scatter = function(context, config) {
		config.options = helpers.configMerge(defaultConfig, config.options);
		config.type = 'line';
		return new Chart(context, config);
	}
	
}).call(this);
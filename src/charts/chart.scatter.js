(function() {
	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;

	var defaultConfig = {
		hover: {
			mode: 'single',
		},

		scales: {
			xAxes: [{
				type: "linear", // scatter should not use a dataset axis
				display: true,
				position: "bottom",
				id: "x-axis-1", // need an ID so datasets can reference the scale

				// grid line settings
				gridLines: {
					show: true,
					color: "rgba(0, 0, 0, 0.05)",
					lineWidth: 1,
					drawOnChartArea: true,
					drawTicks: true,
					zeroLineWidth: 1,
					zeroLineColor: "rgba(0,0,0,0.25)",
				},

				// scale numbers
				beginAtZero: false,
				override: null,

				// label settings
				labels: {
					show: true,
					template: "<%=value.toLocaleString()%>",
					fontSize: 12,
					fontStyle: "normal",
					fontColor: "#666",
					fontFamily: "Helvetica Neue",
				},
			}],
			yAxes: [{
				type: "linear", // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
				display: true,
				position: "left",
				id: "y-axis-1",

				// grid line settings
				gridLines: {
					show: true,
					color: "rgba(0, 0, 0, 0.05)",
					lineWidth: 1,
					drawOnChartArea: true,
					drawTicks: true, // draw ticks extending towards the label
					zeroLineWidth: 1,
					zeroLineColor: "rgba(0,0,0,0.25)",
				},

				// scale numbers
				beginAtZero: false,
				override: null,

				// label settings
				labels: {
					show: true,
					template: "<%=value.toLocaleString()%>",
					fontSize: 12,
					fontStyle: "normal",
					fontColor: "#666",
					fontFamily: "Helvetica Neue",
				}
			}],
		},

		//String - A legend template
		legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].borderColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>",

		tooltips: {
			template: "(<%= value.x %>, <%= value.y %>)",
			multiTemplate: "<%if (datasetLabel){%><%=datasetLabel%>: <%}%>(<%= value.x %>, <%= value.y %>)",
		},

	};


	Chart.types.Line.extend({
		name: "Scatter",
		defaults: defaultConfig,
	});
}).call(this);

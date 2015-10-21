(function() {
	"use strict";

	var root = this;
	var Chart = root.Chart;
	var helpers = Chart.helpers;

	var defaultConfig = {
		aspectRatio: 1,
		legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i = 0; i < data.datasets[0].data.length; i++){%><li><span style=\"background-color:<%=data.datasets[0].backgroundColor[i]%>\"><%if(data.labels && i < data.labels.length){%><%=data.labels[i]%><%}%></span></li><%}%></ul>",
	};

	Chart.PolarArea = function(context, config) {
		config.options = helpers.configMerge(defaultConfig, config.options);
		config.type = 'polarArea';

		return new Chart(context, config);
	};
	
}).call(this);

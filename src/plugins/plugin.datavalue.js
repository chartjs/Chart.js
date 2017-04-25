'use strict';

module.exports = function(Chart) {

	var helpers = Chart.helpers;
	// var noop = helpers.noop;
	Chart.defaults.global.dataLabels = {
		// position: 'top',
		fontWeight: 'normal',
		fontColor: '#000'
		// truncate: true
	};
	function DrawLabel(chart, element, value, index) {
		var opts = chart.options.dataLabels;
		var ctx = chart.ctx;
		var position = element.tooltipPosition();
		var top = position.y;
		var left = position.x;
		ctx.textAlign='center';
		var fillStyle = opts.fontColor;
		if (typeof fillStyle === 'object') {
			fillStyle = fillStyle[index] || '#000';
		}
		ctx.fillStyle = fillStyle;
		ctx.font=helpers.fontString(10, opts.fontWeight);
		ctx.fillText(value, left, top);

	}
	return {
		id: 'dataLabels',
		afterDatasetsDraw: function(chart) {
			chart.data.datasets.forEach(function(dataset, i) {
				var elements = chart.getDatasetMeta(i);
				// elements are hidden when the legends are clicked
				if (!elements.hidden) {
					elements.data.forEach(function(element, index) {
						var d = dataset.data[index];
						if (d !== null && d !== undefined && !isNaN(d)) {
							if (dataset.drawLabel) {
								DrawLabel(chart, element, d.toString(), index);
							}
						}
					});
				}
			});
		}
	};
};

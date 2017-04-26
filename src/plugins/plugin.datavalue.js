'use strict';

module.exports = function(Chart) {

	var helpers = Chart.helpers;
	// var noop = helpers.noop;
	Chart.defaults.global.valueLabel = {
		// position: 'top',
		fontWeight: 'normal',
		fontColor: '#000',
		fontSize: 10,
		padding: {top: 0, left: 0}
		// truncate: true
	};
	function DrawValue(chart, element, value, index, chartype) {
		var opts = chart.options.valueLabel;
		var ctx = chart.ctx;
		var position = element.getCenterPoint();
		// print the value on the top of the bars.
		if (chartype === 'bar') {
			position = element.tooltipPosition();
			position.y += opts.fontSize;
		}
		var top = position.y + opts.padding.top;
		var left = position.x+ opts.padding.left;
		// set the font of the context
		ctx.textAlign='center';
		var fillStyle = opts.fontColor;
		if (typeof fillStyle === 'object') {
			fillStyle = fillStyle[index] || '#000';
		}
		ctx.fillStyle = fillStyle;
		ctx.font=helpers.fontString(opts.fontSize, opts.fontWeight);
		// get the value to be displayed.
		if (opts.value) {
			value = opts.value(chart, value);
		}
		ctx.fillText(value, left, top);

	}
	return {
		id: 'valueLabel',
		afterDatasetsDraw: function(chart) {
			chart.data.datasets.forEach(function(dataset, i) {
				var elements = chart.getDatasetMeta(i);
				// elements are hidden when the legends are clicked
				if (!elements.hidden) {
					elements.data.forEach(function(element, index) {
						var d = dataset.data[index];
						if (d !== null && d !== undefined && !isNaN(d)) {
							if (dataset.drawValue) {
								DrawValue(chart, element, d.toString(), index, elements.type);
							}
						}
					});
				}
			});
		}
	};
};

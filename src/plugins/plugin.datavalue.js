'use strict';

module.exports = function(Chart) {

	var helpers = Chart.helpers;
	Chart.defaults.global.valueLabel = {
		fontWeight: 'normal',
		fontColor: '#000',
		fontSize: 10,
		padding: {top: 0, left: 0}
	};
	/**
	* displays the object  in a k1:v1,k2,v2..kn:vn form
	* @param a value
	* @return string form for a value
	* object.prototype wasnt being accepted.
	**/
	function display(a) {
		if (!isNaN(a)) {
			return a.toString();
		}
		var l = [];
		// gulp cant minify for..of loops
		for (var i in a) {
			if ((a.hasOwnProperty(i))) {
				l.push(i +':' + a[i]);
			}
		}
		return l.join(',');

	}
	/**
	* Calcuates the position and draes the text.
	* @param chart {Chart},
	* @param element {Chart.Element },
	* @param value the value that needs to be displayed
	* @param index {Int} index of the dataset.
	**/
	function drawValue(chart, element, value, index) {
		var opts = chart.options.valueLabel;
		var ctx = chart.ctx;
		var position = element.getCenterPoint();
		// print the value on the top of the bars.
		if (element instanceof Chart.elements.Rectangle) {
			var pos = position.y;
			position = element.tooltipPosition();
			// negative bars
			if (pos < position.y) {
				position.y -= opts.fontSize;
			}
		}
		var top = position.y + opts.padding.top;
		var left = position.x+ opts.padding.left;
		// set the font of the context
		ctx.textAlign='center';
		ctx.fillStyle = helpers.getValueAtIndexOrDefault(opts.fontColor, index, '#000');
		ctx.font=helpers.fontString(opts.fontSize, opts.fontWeight);
		// get the value to be displayed.
		if (opts.value) {
			value = opts.value.call(element, chart, value);
		} else {
			value = display(value);
		}
		ctx.fillText(value, left, top);
	}
	return {
		id: 'valueLabel',
		afterDatasetsDraw: function(chart) {
			chart.data.datasets.filter(function(ds) {
				return ds.drawValue;
			}).forEach(function(dataset, i) {
				var elements = chart.getDatasetMeta(i);
				// elements are hidden when the legends are clicked
				if (!elements.hidden) {
					elements.data.forEach(function(element, index) {
						var d = dataset.data[index];
						if (d && d !== null && d !== undefined) {
							drawValue(chart, element, d, i);
						}
					});
				}
			});
		}
	};
};

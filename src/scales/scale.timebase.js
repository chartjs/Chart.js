/* global window: false */
'use strict';

var moment = require('moment');
moment = typeof(moment) === 'function' ? moment : window.moment;

module.exports = function(Chart) {

	var helpers = Chart.helpers;
	var timeHelpers = helpers.time;

	Chart.TimeScaleBase = Chart.Scale.extend({
		initialize: function() {
			if (!moment) {
				throw new Error('Chart.js - Moment.js could not be found! You must include it before Chart.js to use the time scale. Download at https://momentjs.com');
			}

			this.mergeTicksOptions();

			Chart.Scale.prototype.initialize.call(this);
		},
		// Get tooltip label
		getLabelForIndex: function(index, datasetIndex) {
			var me = this;
			var label = me.chart.data.labels && index < me.chart.data.labels.length ? me.chart.data.labels[index] : '';
			var value = me.chart.data.datasets[datasetIndex].data[index];

			if (value !== null && typeof value === 'object') {
				label = me.getRightValue(value);
			}

			// Format nicely
			if (me.options.time.tooltipFormat) {
				label = timeHelpers.parseTime(me, label).format(me.options.time.tooltipFormat);
			}

			return label;
		},
    // Function to format an individual tick mark
		tickFormatFunction: function(tick, index, ticks) {
			var formattedTick;
			var tickClone = tick.clone();
			var tickTimestamp = tick.valueOf();
			var major = false;
			var tickOpts;
			if (this.majorUnit && this.majorDisplayFormat && tickTimestamp === tickClone.startOf(this.majorUnit).valueOf()) {
				// format as major unit
				formattedTick = tick.format(this.majorDisplayFormat);
				tickOpts = this.options.ticks.major;
				major = true;
			} else {
				// format as minor (base) unit
				formattedTick = tick.format(this.displayFormat);
				tickOpts = this.options.ticks.minor;
			}

			var callback = helpers.valueOrDefault(tickOpts.callback, tickOpts.userCallback);

			if (callback) {
				return {
					value: callback(formattedTick, index, ticks),
					major: major
				};
			}
			return {
				value: formattedTick,
				major: major
			};
		},
		convertTicksToLabels: function() {
			var me = this;
			me.ticksAsTimestamps = me.ticks;
			me.ticks = me.ticks.map(function(tick) {
				return moment(tick);
			}).map(me.tickFormatFunction, me);
		},
		// Crude approximation of what the label width might be
		getLabelWidth: function(label) {
			var me = this;
			var ticks = me.options.ticks;

			var tickLabelWidth = me.ctx.measureText(label).width;
			var cosRotation = Math.cos(helpers.toRadians(ticks.maxRotation));
			var sinRotation = Math.sin(helpers.toRadians(ticks.maxRotation));
			var tickFontSize = helpers.valueOrDefault(ticks.fontSize, Chart.defaults.global.defaultFontSize);
			return (tickLabelWidth * cosRotation) + (tickFontSize * sinRotation);
		},
		getLabelCapacity: function(exampleTime) {
			var me = this;

			me.displayFormat = me.options.time.displayFormats.millisecond;	// Pick the longest format for guestimation
			var exampleLabel = me.tickFormatFunction(moment(exampleTime), 0, []).value;
			var tickLabelWidth = me.getLabelWidth(exampleLabel);

			var innerWidth = me.isHorizontal() ? me.width : me.height;
			var labelCapacity = innerWidth / tickLabelWidth;

			return labelCapacity;
		}
	});
};

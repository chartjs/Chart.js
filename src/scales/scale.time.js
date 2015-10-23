(function() {
	"use strict";

	if (!window.moment) {
		console.warn('Chart.js - Moment.js could not be found! You must include it before Chart.js to use the time scale. Download at http://momentjs.com/');
		return;
	}

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;

	var time = {
		units: [
			'millisecond',
			'second',
			'minute',
			'hour',
			'day',
			'week',
			'month',
			'quarter',
			'year',
		],
		unit: {
			'millisecond': {
				display: 'SSS [ms]', // 002 ms
				maxStep: 1000,
			},
			'second': {
				display: 'h:mm:ss a', // 11:20:01 AM
				maxStep: 60,
			},
			'minute': {
				display: 'h:mm:ss a', // 11:20:01 AM
				maxStep: 60,
			},
			'hour': {
				display: 'MMM D, hA', // Sept 4, 5PM
				maxStep: 24,
			},
			'day': {
				display: 'll', // Sep 4 2015
				maxStep: 7,
			},
			'week': {
				display: 'll', // Week 46, or maybe "[W]WW - YYYY" ?
				maxStep: 4.3333,
			},
			'month': {
				display: 'MMM YYYY', // Sept 2015
				maxStep: 12,
			},
			'quarter': {
				display: '[Q]Q - YYYY', // Q3
				maxStep: 4,
			},
			'year': {
				display: 'YYYY', // 2015
				maxStep: false,
			},
		}
	};

	var defaultConfig = {
		position: "bottom",

		time: {
			format: false, // false == date objects or use pattern string from http://momentjs.com/docs/#/parsing/string-format/
			unit: false, // false == automatic or override with week, month, year, etc.
			round: false, // none, or override with week, month, year, etc.
			displayFormat: false, // defaults to unit's corresponding unitFormat below or override using pattern string from http://momentjs.com/docs/#/displaying/format/
		},
	};

	var TimeScale = Chart.Scale.extend({
		getLabelMoment: function(datasetIndex, index) {
			return this.labelMoments[datasetIndex][index];
		},

		buildLabelMoments: function() {
			// Only parse these once. If the dataset does not have data as x,y pairs, we will use
			// these 
			var scaleLabelMoments = [];
			if (this.data.labels && this.data.labels.length > 0) {
				helpers.each(this.data.labels, function(label, index) {
					var labelMoment = this.parseTime(label);
					if (this.options.time.round) {
						labelMoment.startOf(this.options.time.round);
					}
					scaleLabelMoments.push(labelMoment);
				}, this);

				if (this.options.time.min) {
					this.firstTick = this.parseTime(this.options.time.min);
				} else {
					this.firstTick = moment.min.call(this, scaleLabelMoments);
				}

				if (this.options.time.max) {
					this.lastTick = this.parseTime(this.options.time.max);
				} else {
					this.lastTick = moment.max.call(this, scaleLabelMoments);
				}
			} else {
				this.firstTick = null;
				this.lastTick = null;
			}

			helpers.each(this.data.datasets, function(dataset, datasetIndex) {
				var momentsForDataset = [];

				if (typeof dataset.data[0] === 'object') {
					helpers.each(dataset.data, function(value, index) {
						var labelMoment = this.parseTime(this.getRightValue(value));
						if (this.options.time.round) {
							labelMoment.startOf(this.options.time.round);
						}
						momentsForDataset.push(labelMoment);

						// May have gone outside the scale ranges, make sure we keep the first and last ticks updated
						this.firstTick = this.firstTick !== null ? moment.min(this.firstTick, labelMoment) : labelMoment;
						this.lastTick = this.lastTick !== null ? moment.max(this.lastTick, labelMoment) : labelMoment;
					}, this);
				} else {
					// We have no labels. Use the ones from the scale
					momentsForDataset = scaleLabelMoments;
				}

				this.labelMoments.push(momentsForDataset);
			}, this);

			// We will modify these, so clone for later
			this.firstTick = this.firstTick.clone();
			this.lastTick = this.lastTick.clone();
		},

		buildTicks: function(index) {

			this.ticks = [];
			this.labelMoments = [];

			this.buildLabelMoments();

			// Set unit override if applicable
			if (this.options.time.unit) {
				this.tickUnit = this.options.time.unit || 'day';
				this.displayFormat = time.unit[this.tickUnit].display;
				this.tickRange = Math.ceil(this.lastTick.diff(this.firstTick, this.tickUnit, true));
			} else {
				// Determine the smallest needed unit of the time
				var innerWidth = this.width - (this.paddingLeft + this.paddingRight);
				var labelCapacity = innerWidth / this.options.ticks.fontSize + 4;
				var buffer = this.options.time.round ? 0 : 2;

				// Start as small as possible
				this.tickUnit = 'millisecond';
				this.tickRange = Math.ceil(this.lastTick.diff(this.firstTick, this.tickUnit, true) + buffer);
				this.displayFormat = time.unit[this.tickUnit].display;

				// Work our way up to comfort
				helpers.each(time.units, function(format) {
					if (this.tickRange <= labelCapacity) {
						return;
					}
					this.tickUnit = format;
					this.tickRange = Math.ceil(this.lastTick.diff(this.firstTick, this.tickUnit) + buffer);
					this.displayFormat = time.unit[format].display;

				}, this);
			}

			this.firstTick.startOf(this.tickUnit);
			this.lastTick.endOf(this.tickUnit);
			this.smallestLabelSeparation = this.width;

			helpers.each(this.data.datasets, function(dataset, datasetIndex) {
				for (var i = 1; i < this.labelMoments[datasetIndex].length; i++) {
					this.smallestLabelSeparation = Math.min(this.smallestLabelSeparation, this.labelMoments[datasetIndex][i].diff(this.labelMoments[datasetIndex][i - 1], this.tickUnit, true));
				}
			}, this);

			// Tick displayFormat override
			if (this.options.time.displayFormat) {
				this.displayFormat = this.options.time.displayFormat;
			}

			// For every unit in between the first and last moment, create a moment and add it to the ticks tick
			for (var i = 0; i <= this.tickRange; ++i) {
				this.ticks.push(this.firstTick.clone().add(i, this.tickUnit));
			}
		},
		// Get tooltip label
		getLabelForIndex: function(index, datasetIndex) {
			var label = this.data.labels && index < this.data.labels.length ? this.data.labels[index] : '';

			if (typeof this.data.datasets[datasetIndex].data[0] === 'object') {
				label = this.getRightValue(this.data.datasets[datasetIndex].data[index]);
			}

			return label;
		},
		convertTicksToLabels: function() {
			this.ticks = this.ticks.map(function(tick, index, ticks) {
				var formattedTick = tick.format(this.options.time.displayFormat ? this.options.time.displayFormat : time.unit[this.tickUnit].display);

				if (this.options.ticks.userCallback) {
					return this.options.ticks.userCallback(formattedTick, index, ticks);
				} else {
					return formattedTick;
				}
			}, this);
		},
		getPixelForValue: function(value, index, datasetIndex, includeOffset) {
			var labelMoment = this.getLabelMoment(datasetIndex, index);
			var offset = labelMoment.diff(this.firstTick, this.tickUnit, true);

			var decimal = offset / this.tickRange;

			if (this.isHorizontal()) {
				var innerWidth = this.width - (this.paddingLeft + this.paddingRight);
				var valueWidth = innerWidth / Math.max(this.ticks.length - 1, 1);
				var valueOffset = (innerWidth * decimal) + this.paddingLeft;

				return this.left + Math.round(valueOffset);
			} else {
				//return this.top + (decimal * (this.height / this.ticks.length));
				var innerHeight = this.height - (this.paddingTop + this.paddingBottom);
				var valueHeight = innerHeight / Math.max(this.ticks.length - 1, 1);
				var heightOffset = (innerHeight * decimal) + this.paddingTop;

				return this.top + Math.round(heightOffset);
			}
		},
		parseTime: function(label) {
			// Date objects
			if (typeof label.getMonth === 'function' || typeof label == 'number') {
				return moment(label);
			}
			// Moment support
			if (label.isValid && label.isValid()) {
				return label;
			}
			// Custom parsing (return an instance of moment)
			if (typeof this.options.time.format !== 'string' && this.options.time.format.call) {
				return this.options.time.format(label);
			}
			// Moment format parsing
			return moment(label, this.options.time.format);
		},
	});
	Chart.scaleService.registerScaleType("time", TimeScale, defaultConfig);

}).call(this);

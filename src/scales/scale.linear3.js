'use strict';

module.exports = function(Chart) {

	var helpers = Chart.helpers;

	// Fine linear scale default config
	var defaultConfig = {
		// for scale (level:0)
		position: 'left',
		ticks: {
			autoSkip: false,
		},

		// for sub scale (level:1)
		subScale: {
			display: true,
			ticks: {
				display: true,
				fontSize: 11,
			},
			gridLines: {
				display: true,
				drawTicks: true,
				color: 'rgba(0, 0, 0, 0.07)',
			},
			// for sub-sub scale (level:2)
			subScale: {
				display: true,
				ticks: {
					display: false,
					fontSize: 10,
				},
				gridLines: {
					display: true,
					drawTicks: true,
					color: 'rgba(0, 0, 0, 0.03)',
				},
			}
		}
	};

	// Fine linear scale
	var baseScale = Chart.scaleService.getScaleConstructor('linear');
	var linear3Scale = baseScale.extend({

		// ----------------------
		// scale.linearbase.js Replacement
		// ----------------------

		ticksReverse: function() {
			var me = this;
			me.ticks.reverse();
			me.ticksLevel.reverse();
		},

		handleDirectionalChanges: function() {
			var me = this;
			if (!me.isHorizontal()) {
				// We are in a vertical orientation. The top value is the highest. So reverse the array
				// this.ticks.reverse();
				me.ticksReverse();
			}
		},

		// Compute an tick number upper limit depending on display area.
		getTickLimit: function() {
			var me = this;
			var maxTicks;
			var optsTick = me.options.ticks;

			if (me.isHorizontal()) {
				maxTicks = Math.min(optsTick.maxTicksLimit? optsTick.maxTicksLimit: 11, Math.ceil(me.width / 25));
			} else {
				// The factor of 1.5 used to scale the font size has been experimentally determined.
				var tickFontSize = helpers.getValueOrDefault(optsTick.fontSize, Chart.defaults.global.defaultFontSize);
				maxTicks = Math.min(optsTick.maxTicksLimit? optsTick.maxTicksLimit: 11, Math.ceil(me.height / (1.5 * tickFontSize)));
			}
			// Minimum is 2.
			return Math.max(2, maxTicks);
		},

		// Build of ticks
		buildTicks: function() {
			var me = this;
			// constant of sub scale max.
			me.levelMax = 3;
			// options
			var opts = me.options;
			var optsTick = [opts.ticks, opts.subScale.ticks, opts.subScale.subScale.ticks];

			var numericGeneratorOptions = {
				maxTicks: me.getTickLimit(),
				min: optsTick[0].min,
				max: optsTick[0].max,
				stepSize: helpers.getValueOrDefault(optsTick[0].fixedStepSize, optsTick[0].stepSize),
				optsTick: optsTick,
				levelMax: me.levelMax
			};
			var fineLinear = Chart.Ticks.generators.fineLinear(numericGeneratorOptions, me);
			me.ticks = fineLinear.ticks;
			me.ticksLevel = fineLinear.levels;
			// At this point, we need to update our max and min given the tick values
			// since we have expanded the range of the scale
			me.max = fineLinear.max;
			me.min = fineLinear.min;
			me.handleDirectionalChanges();

			// Handling the reverse option.
			if (optsTick[0].reverse) {
				me.ticksReverse();
				me.start = me.max;
				me.end = me.min;
			} else {
				me.start = me.min;
				me.end = me.max;
			}
		},

	});

	// regist fineLinear
	Chart.scaleService.registerScaleType('linear3', linear3Scale, defaultConfig);
};

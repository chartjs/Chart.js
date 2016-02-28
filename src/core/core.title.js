"use strict";

module.exports = function(Chart) {

	var helpers = Chart.helpers;

	Chart.defaults.global.title = {
		display: false,
		position: 'top',
		fullWidth: true, // marks that this box should take the full width of the canvas (pushing down other boxes)

		fontStyle: 'bold',
		padding: 10,

		// actual title
		text: ''
	};

	Chart.Title = Chart.Element.extend({

		initialize: function(config) {
			helpers.extend(this, config);
			this.options = helpers.configMerge(Chart.defaults.global.title, config.options);

			// Contains hit boxes for each dataset (in dataset order)
			this.legendHitBoxes = [];
		},

		// These methods are ordered by lifecyle. Utilities then follow.

		beforeUpdate: helpers.noop,
		update: function(maxWidth, maxHeight, margins) {

			// Update Lifecycle - Probably don't want to ever extend or overwrite this function ;)
			this.beforeUpdate();

			// Absorb the master measurements
			this.maxWidth = maxWidth;
			this.maxHeight = maxHeight;
			this.margins = margins;

			// Dimensions
			this.beforeSetDimensions();
			this.setDimensions();
			this.afterSetDimensions();
			// Labels
			this.beforeBuildLabels();
			this.buildLabels();
			this.afterBuildLabels();

			// Fit
			this.beforeFit();
			this.fit();
			this.afterFit();
			//
			this.afterUpdate();

			return this.minSize;

		},
		afterUpdate: helpers.noop,

		//

		beforeSetDimensions: helpers.noop,
		setDimensions: function() {
			// Set the unconstrained dimension before label rotation
			if (this.isHorizontal()) {
				// Reset position before calculating rotation
				this.width = this.maxWidth;
				this.left = 0;
				this.right = this.width;
			} else {
				this.height = this.maxHeight;

				// Reset position before calculating rotation
				this.top = 0;
				this.bottom = this.height;
			}

			// Reset padding
			this.paddingLeft = 0;
			this.paddingTop = 0;
			this.paddingRight = 0;
			this.paddingBottom = 0;

			// Reset minSize
			this.minSize = {
				width: 0,
				height: 0
			};
		},
		afterSetDimensions: helpers.noop,

		//

		beforeBuildLabels: helpers.noop,
		buildLabels: helpers.noop,
		afterBuildLabels: helpers.noop,

		//

		beforeFit: helpers.noop,
		fit: function() {

			var ctx = this.ctx;
			var fontSize = helpers.getValueOrDefault(this.options.fontSize, Chart.defaults.global.defaultFontSize);
			var fontStyle = helpers.getValueOrDefault(this.options.fontStyle, Chart.defaults.global.defaultFontStyle);
			var fontFamily = helpers.getValueOrDefault(this.options.fontFamily, Chart.defaults.global.defaultFontFamily);
			var titleFont = helpers.fontString(fontSize, fontStyle, fontFamily);

			// Width
			if (this.isHorizontal()) {
				this.minSize.width = this.maxWidth; // fill all the width
			} else {
				this.minSize.width = 0;
			}

			// height
			if (this.isHorizontal()) {
				this.minSize.height = 0;
			} else {
				this.minSize.height = this.maxHeight; // fill all the height
			}

			// Increase sizes here
			if (this.isHorizontal()) {

				// Title
				if (this.options.display) {
					this.minSize.height += fontSize + (this.options.padding * 2);
				}
			} else {
				if (this.options.display) {
					this.minSize.width += fontSize + (this.options.padding * 2);
				}
			}

			this.width = this.minSize.width;
			this.height = this.minSize.height;

		},
		afterFit: helpers.noop,

		// Shared Methods
		isHorizontal: function() {
			return this.options.position === "top" || this.options.position === "bottom";
		},

		// Actualy draw the title block on the canvas
		draw: function() {
			if (this.options.display) {
				var ctx = this.ctx;
				var titleX, titleY;

				var fontColor = helpers.getValueOrDefault(this.options.fontColor, Chart.defaults.global.defaultFontColor);
				var fontSize = helpers.getValueOrDefault(this.options.fontSize, Chart.defaults.global.defaultFontSize);
				var fontStyle = helpers.getValueOrDefault(this.options.fontStyle, Chart.defaults.global.defaultFontStyle);
				var fontFamily = helpers.getValueOrDefault(this.options.fontFamily, Chart.defaults.global.defaultFontFamily);
				var titleFont = helpers.fontString(fontSize, fontStyle, fontFamily);

				ctx.fillStyle = fontColor; // render in correct colour
				ctx.font = titleFont;

				// Horizontal
				if (this.isHorizontal()) {
					// Title
					ctx.textAlign = "center";
					ctx.textBaseline = 'middle';

					titleX = this.left + ((this.right - this.left) / 2); // midpoint of the width
					titleY = this.top + ((this.bottom - this.top) / 2); // midpoint of the height

					ctx.fillText(this.options.text, titleX, titleY);
				} else {

					// Title
					titleX = this.options.position === 'left' ? this.left + (fontSize / 2) : this.right - (fontSize / 2);
					titleY = this.top + ((this.bottom - this.top) / 2);
					var rotation = this.options.position === 'left' ? -0.5 * Math.PI : 0.5 * Math.PI;

					ctx.save();
					ctx.translate(titleX, titleY);
					ctx.rotate(rotation);
					ctx.textAlign = "center";
					ctx.textBaseline = 'middle';
					ctx.fillText(this.options.text, 0, 0);
					ctx.restore();
				}
			}
		}
	});
};
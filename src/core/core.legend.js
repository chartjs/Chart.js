(function() {
	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;

	Chart.defaults.legend = {

		display: true,
		position: 'top',
		onClick: false, // a callback will override the default behavior of toggling the datasets

		title: {
			position: 'top',
			fontColor: '#666',
			fontFamily: 'Helvetica Neue',
			fontSize: 12,
			fontStyle: 'bold',
			padding: 10,

			// actual title
			text: '',

			// display property
			display: false,
		},

		labels: {
			fontSize: 12,
			fontStyle: "normal",
			fontColor: "#666",
			fontFamily: "Helvetica Neue",
			padding: 10,
			reverse: false,
			display: true,
			callback: function(value) {
				return '' + value;
			},
		},
	};

	Chart.Legend = Chart.Element.extend({

		initialize: function(config) {
			helpers.extend(this, config);
			this.options = helpers.configMerge(Chart.defaults.legend, config.options);
		},

		// These methods are ordered by lifecyle. Utilities then follow.
		// Any function defined here is inherited by all legend types.
		// Any function can be extended by the legend type

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
		},
		afterSetDimensions: helpers.noop,

		//

		beforeBuildLabels: helpers.noop,
		buildLabels: function() {
			// Convert ticks to strings
			this.labels = this.chart.data.datasets.map(function(dataset) {
				return this.options.labels.callback.call(this, dataset.label);
			}, this);
		},
		afterBuildLabels: helpers.noop,

		//

		beforeFit: helpers.noop,
		fit: function() {

			var ctx = this.ctx;
			var titleFont = helpers.fontString(this.options.title.fontSize, this.options.title.fontStyle, this.options.title.fontFamily);
			var labelFont = helpers.fontString(this.options.labels.fontSize, this.options.labels.fontStyle, this.options.labels.fontFamily);

			this.minSize = {
				width: 0,
				height: 0,
			};

			// Legends can use all available space by default as no alignment to the chartArea is necessary	

			// Width
			if (this.isHorizontal()) {
				this.minSize.width = this.maxWidth; // fill all the width
			} else {
				this.minSize.width = this.options.display ? 10 : 0;
			}

			// height
			if (this.isHorizontal()) {
				this.minSize.height = this.options.display ? 10 : 0;
			} else {
				this.minSize.height = this.maxHeight; // fill all the height
			}

			// Increase sizes here
			if (this.isHorizontal()) {

				// Title
				if (this.options.title.display) {
					this.minSize.height += this.options.title.fontSize + (this.options.title.padding * 2);
				}

				// Labels

				var totalWidth = 0;
				var totalHeight = this.labels.length ? this.options.labels.fontSize + (this.options.labels.padding) : 0;

				ctx.font = labelFont;

				helpers.each(this.labels, function(label, i) {
					var width = ctx.measureText(label).width;
					if (totalWidth + width > this.width) {
						totalHeight += this.options.labels.fontSize + (this.options.labels.padding);
						totalWidth = 0;
					}
					totalWidth += width + this.options.labels.padding;
				}, this);

				this.minSize.height += totalHeight;

			} else {
				// TODO vertical
			}

			this.width = this.minSize.width;
			this.height = this.minSize.height;

		},
		afterFit: helpers.noop,

		// Shared Methods
		isHorizontal: function() {
			return this.options.position == "top" || this.options.position == "bottom";
		},

		// Actualy draw the legend on the canvas
		draw: function() {
			if (this.options.display) {

				var ctx = this.ctx;
				var cursor = {
					x: this.left,
					y: this.top,
				};

				// Horizontal
				if (this.isHorizontal()) {

					// Title Spacing if on top
					if (this.options.title.display && this.options.title.position == 'top') {
						cursor.y += this.options.title.fontSize + (this.options.title.padding * 2);
					}

					// Labels
					ctx.textAlign = "left";
					ctx.textBaseline = 'top';
					ctx.fillStyle = this.options.labels.fontColor; // render in correct colour
					ctx.font = helpers.fontString(this.options.labels.fontSize, this.options.labels.fontStyle, this.options.labels.fontFamily);

					helpers.each(this.labels, function(label, i) {
						var width = ctx.measureText(label).width;
						if (cursor.x + width > this.width) {
							cursor.y += this.options.labels.fontSize + (this.options.labels.padding);
							cursor.x = this.left;
						}
						ctx.fillText(label, cursor.x, cursor.y);
						cursor.x += width + (this.options.labels.padding);
					}, this);


					// Title
					if (this.options.title.display) {

						ctx.textAlign = "center";
						ctx.textBaseline = 'middle';
						ctx.fillStyle = this.options.title.fontColor; // render in correct colour
						ctx.font = helpers.fontString(this.options.title.fontSize, this.options.title.fontStyle, this.options.title.fontFamily);

						var titleX = this.left + ((this.right - this.left) / 2); // midpoint of the width
						var titleY = this.options.position == 'bottom' ? this.bottom - (this.options.title.fontSize / 2) - this.options.title.padding : this.top + (this.options.title.fontSize / 2) + this.options.title.padding;

						ctx.fillText(this.options.title.text, titleX, titleY);
					}


				} else {

					// Title
					if (this.options.title.display) {

						// Draw the legend label
						titleX = this.options.position == 'left' ? this.left + (this.options.title.fontSize / 2) : this.right - (this.options.title.fontSize / 2);
						titleY = this.top + ((this.bottom - this.top) / 2);
						var rotation = this.options.position == 'left' ? -0.5 * Math.PI : 0.5 * Math.PI;

						ctx.save();
						ctx.translate(titleX, titleY);
						ctx.rotate(rotation);
						ctx.textAlign = "center";
						ctx.fillStyle = this.options.title.fontColor; // render in correct colour
						ctx.font = helpers.fontString(this.options.title.fontSize, this.options.title.fontStyle, this.options.title.fontFamily);
						ctx.textBaseline = 'middle';
						ctx.fillText(this.options.title.text, 0, 0);
						ctx.restore();

					}

				}
			}
		}
	});

}).call(this);

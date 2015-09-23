(function() {
	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;

	Chart.defaults.scale = {
		display: true,

		// grid line settings
		gridLines: {
			show: true,
			color: "rgba(0, 0, 0, 0.1)",
			lineWidth: 1,
			drawOnChartArea: true,
			drawTicks: true,
			zeroLineWidth: 1,
			zeroLineColor: "rgba(0,0,0,0.25)",
			offsetGridLines: false,
		},

		// label settings
		ticks: {
			show: true,
			minRotation: 20,
			maxRotation: 90,
			template: "<%=value%>",
			fontSize: 12,
			fontStyle: "normal",
			fontColor: "#666",
			fontFamily: "Helvetica Neue",
		},
	};

	Chart.Scale = Chart.Element.extend({
		isHorizontal: function() {
			return this.options.position == "top" || this.options.position == "bottom";
		},
		calculateTickRotation: function(maxHeight, margins) {
			//Get the width of each grid by calculating the difference
			//between x offsets between 0 and 1.
			var labelFont = helpers.fontString(this.options.ticks.fontSize, this.options.ticks.fontStyle, this.options.ticks.fontFamily);
			this.ctx.font = labelFont;

			var firstWidth = this.ctx.measureText(this.ticks[0]).width;
			var lastWidth = this.ctx.measureText(this.ticks[this.ticks.length - 1]).width;
			var firstRotated;
			var lastRotated;

			this.paddingRight = lastWidth / 2 + 3;
			this.paddingLeft = firstWidth / 2 + 3;

			this.labelRotation = 0;

			if (this.options.display) {
				var originalLabelWidth = helpers.longestText(this.ctx, labelFont, this.ticks);
				var cosRotation;
				var sinRotation;
				var firstRotatedWidth;

				this.labelWidth = originalLabelWidth;

				//Allow 3 pixels x2 padding either side for label readability
				// only the index matters for a dataset scale, but we want a consistent interface between scales

				var tickWidth = this.ruler.tick - 6;

				//Max label rotation can be set or default to 90 - also act as a loop counter
				while (this.labelWidth > tickWidth && this.labelRotation <= this.options.ticks.maxRotation) {
					cosRotation = Math.cos(helpers.toRadians(this.labelRotation));
					sinRotation = Math.sin(helpers.toRadians(this.labelRotation));

					firstRotated = cosRotation * firstWidth;
					lastRotated = cosRotation * lastWidth;

					// We're right aligning the text now.
					if (firstRotated + this.options.ticks.fontSize / 2 > this.yLabelWidth) {
						this.paddingLeft = firstRotated + this.options.ticks.fontSize / 2;
					}

					this.paddingRight = this.options.ticks.fontSize / 2;

					if (sinRotation * originalLabelWidth > maxHeight) {
						// go back one step
						this.labelRotation--;
						break;
					}

					this.labelRotation++;
					this.labelRotation = Math.max(this.labelRotation, this.options.ticks.minRotation);
					this.labelWidth = cosRotation * originalLabelWidth;

				}
			} else {
				this.labelWidth = 0;
				this.paddingRight = 0;
				this.paddingLeft = 0;
			}

			if (margins) {
				this.paddingLeft -= margins.left;
				this.paddingRight -= margins.right;

				this.paddingLeft = Math.max(this.paddingLeft, 0);
				this.paddingRight = Math.max(this.paddingRight, 0);
			}

		},
		getPixelForValue: function(value, index, datasetIndex, includeOffset) {
			// This must be called after fit has been run so that 
			//      this.left, this.top, this.right, and this.bottom have been defined
			if (this.isHorizontal()) {
				var isRotated = (this.labelRotation > 0);
				var innerWidth = this.width - (this.paddingLeft + this.paddingRight);
				var valueWidth = innerWidth / Math.max((this.data.labels.length - ((this.options.gridLines.offsetGridLines) ? 0 : 1)), 1);
				var valueOffset = (valueWidth * index) + this.paddingLeft;

				if (this.options.gridLines.offsetGridLines && includeOffset) {
					valueOffset += (valueWidth / 2);
				}

				return this.left + Math.round(valueOffset);
			} else {
				return this.top + (index * (this.height / this.labels.length));
			}
		},
		getPixelFromTickIndex: function(index, includeOffset) {
			// This must be called after fit has been run so that 
			//      this.left, this.top, this.right, and this.bottom have been defined
			if (this.isHorizontal()) {
				var innerWidth = this.width - (this.paddingLeft + this.paddingRight);
				var tickWidth = innerWidth / Math.max((this.ticks.length - ((this.options.gridLines.offsetGridLines) ? 0 : 1)), 1);
				var pixel = (tickWidth * index) + this.paddingLeft;

				if (includeOffset) {
					pixel += tickWidth / 2;
				}
				return this.left + Math.round(pixel);
			} else {
				return this.top + (index * (this.height / this.ticks.length));
			}
		},
		getPixelFromDecimal: function(decimal, includeOffset) {
			// This must be called after fit has been run so that 
			//      this.left, this.top, this.right, and this.bottom have been defined
			if (this.isHorizontal()) {
				var innerWidth = this.width - (this.paddingLeft + this.paddingRight);
				var valueOffset = (innerWidth * decimal) + this.paddingLeft;

				return this.left + Math.round(valueOffset);
			} else {
				return this.top + (decimal * (this.height / this.ticks.length));
			}
		},
		// Fit this axis to the given size
		// @param {number} maxWidth : the max width the axis can be
		// @param {number} maxHeight: the max height the axis can be
		// @return {object} minSize : the minimum size needed to draw the axis
		fit: function(maxWidth, maxHeight, margins) {
			// Set the unconstrained dimension before label rotation
			if (this.isHorizontal()) {
				this.width = maxWidth;
			} else {
				this.height = maxHeight;
			}

			this.buildTicks();
			this.buildRuler();
			this.calculateTickRotation(maxHeight, margins);

			var minSize = {
				width: 0,
				height: 0,
			};

			var labelFont = helpers.fontString(this.options.ticks.fontSize, this.options.ticks.fontStyle, this.options.ticks.fontFamily);
			var longestLabelWidth = helpers.longestText(this.ctx, labelFont, this.ticks);

			// Width
			if (this.isHorizontal()) {
				minSize.width = maxWidth;
			} else if (this.options.display) {
				var labelWidth = this.options.ticks.show ? longestLabelWidth + 6 : 0;
				minSize.width = Math.min(labelWidth, maxWidth);
			}

			// Height
			if (this.isHorizontal() && this.options.display) {
				var labelHeight = (Math.sin(helpers.toRadians(this.labelRotation)) * longestLabelWidth) + 1.5 * this.options.ticks.fontSize;
				minSize.height = Math.min(this.options.ticks.show ? labelHeight : 0, maxHeight);
			} else if (this.options.display) {
				minSize.height = maxHeight;
			}


			this.width = minSize.width;
			this.height = minSize.height;
			return minSize;
		},
		// Actualy draw the scale on the canvas
		// @param {rectangle} chartArea : the area of the chart to draw full grid lines on
		draw: function(chartArea) {
			if (this.options.display) {

				var setContextLineSettings;

				// Make sure we draw text in the correct color
				this.ctx.fillStyle = this.options.ticks.fontColor;

				if (this.isHorizontal()) {
					setContextLineSettings = true;
					var yTickStart = this.options.position == "bottom" ? this.top : this.bottom - 10;
					var yTickEnd = this.options.position == "bottom" ? this.top + 10 : this.bottom;
					var isRotated = this.labelRotation !== 0;
					var skipRatio = false;

					if ((this.options.ticks.fontSize + 4) * this.ticks.length > (this.width - (this.paddingLeft + this.paddingRight))) {
						skipRatio = 1 + Math.floor(((this.options.ticks.fontSize + 4) * this.ticks.length) / (this.width - (this.paddingLeft + this.paddingRight)));
					}

					helpers.each(this.ticks, function(label, index) {
						// Blank ticks
						if ((skipRatio > 1 && index % skipRatio > 0) || (label === undefined || label === null)) {
							return;
						}
						var xLineValue = this.getPixelFromTickIndex(index); // xvalues for grid lines
						var xLabelValue = this.getPixelFromTickIndex(index, this.options.gridLines.offsetGridLines); // x values for ticks (need to consider offsetLabel option)

						if (this.options.gridLines.show) {
							if (index === 0) {
								// Draw the first index specially
								this.ctx.lineWidth = this.options.gridLines.zeroLineWidth;
								this.ctx.strokeStyle = this.options.gridLines.zeroLineColor;
								setContextLineSettings = true; // reset next time
							} else if (setContextLineSettings) {
								this.ctx.lineWidth = this.options.gridLines.lineWidth;
								this.ctx.strokeStyle = this.options.gridLines.color;
								setContextLineSettings = false;
							}

							xLineValue += helpers.aliasPixel(this.ctx.lineWidth);

							// Draw the label area
							this.ctx.beginPath();

							if (this.options.gridLines.drawTicks) {
								this.ctx.moveTo(xLineValue, yTickStart);
								this.ctx.lineTo(xLineValue, yTickEnd);
							}

							// Draw the chart area
							if (this.options.gridLines.drawOnChartArea) {
								this.ctx.moveTo(xLineValue, chartArea.top);
								this.ctx.lineTo(xLineValue, chartArea.bottom);
							}

							// Need to stroke in the loop because we are potentially changing line widths & colours
							this.ctx.stroke();
						}

						if (this.options.ticks.show) {
							this.ctx.save();
							this.ctx.translate(xLabelValue, (isRotated) ? this.top + 12 : this.top + 8);
							this.ctx.rotate(helpers.toRadians(this.labelRotation) * -1);
							this.ctx.font = this.font;
							this.ctx.textAlign = (isRotated) ? "right" : "center";
							this.ctx.textBaseline = (isRotated) ? "middle" : "top";
							this.ctx.fillText(label, 0, 0);
							this.ctx.restore();
						}
					}, this);
				} else {
					// TODO Vertical
					if (this.options.gridLines.show) {}

					if (this.options.ticks.show) {
						// Draw the ticks
					}
				}
			}
		}
	});

}).call(this);

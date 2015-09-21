(function() {
	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;

	var defaultConfig = {
		display: true,
		position: "left",

		// grid line settings
		gridLines: {
			show: true,
			color: "rgba(0, 0, 0, 0.1)",
			lineWidth: 1,
			drawOnChartArea: true,
			drawTicks: true, // draw ticks extending towards the label
			zeroLineWidth: 1,
			zeroLineColor: "rgba(0,0,0,0.25)",
		},

		// scale label
		scaleLabel: {
			fontColor: '#666',
			fontFamily: 'Helvetica Neue',
			fontSize: 12,
			fontStyle: 'normal',

			// actual label
			labelString: '',

			// display property
			show: false,
		},

		// scale numbers
		reverse: false,
		override: null,

		// label settings
		labels: {
			show: true,
			mirror: false,
			padding: 10,
			template: "<%var remain = value / (Math.pow(10, Math.floor(Chart.helpers.log10(value))));if (remain === 1 || remain === 2 || remain === 5) {%><%=value.toExponential()%><%} else {%><%= null %><%}%>",
			fontSize: 12,
			fontStyle: "normal",
			fontColor: "#666",
			fontFamily: "Helvetica Neue"
		}
	};

	var LogarithmicScale = Chart.Element.extend({
		isHorizontal: function() {
			return this.options.position == "top" || this.options.position == "bottom";
		},
		generateTicks: function(width, height) {
			// We need to decide how many ticks we are going to have. Each tick draws a grid line.
			// There are two possibilities. The first is that the user has manually overridden the scale
			// calculations in which case the job is easy. The other case is that we have to do it ourselves
			// 
			// We assume at this point that the scale object has been updated with the following values
			// by the chart.
			//  min: this is the minimum value of the scale
			//  max: this is the maximum value of the scale
			//  options: contains the options for the scale. This is referenced from the user settings
			//      rather than being cloned. This ensures that updates always propogate to a redraw

			// Reset the ticks array. Later on, we will draw a grid line at these positions
			// The array simply contains the numerical value of the spots where ticks will be
			this.ticks = [];

			if (this.options.override) {
				// The user has specified the manual override. We use <= instead of < so that 
				// we get the final line
				for (var i = 0; i <= this.options.override.steps; ++i) {
					var value = this.options.override.start + (i * this.options.override.stepWidth);
					this.ticks.push(value);
				}
			} else {
				// Figure out what the max number of ticks we can support it is based on the size of
				// the axis area. For now, we say that the minimum tick spacing in pixels must be 50
				// We also limit the maximum number of ticks to 11 which gives a nice 10 squares on 
				// the graph

				var minExponent = Math.floor(helpers.log10(this.min));
				var maxExponent = Math.ceil(helpers.log10(this.max));

				for (var exponent = minExponent; exponent < maxExponent; ++exponent) {
					for (var i = 1; i < 10; ++i) {
						this.ticks.push(i * Math.pow(10, exponent));
					}
				}

				this.ticks.push(1.0 * Math.pow(10, maxExponent));
			}

			if (this.options.position == "left" || this.options.position == "right") {
				// We are in a vertical orientation. The top value is the highest. So reverse the array
				this.ticks.reverse();
			}

			// At this point, we need to update our max and min given the tick values since we have expanded the
			// range of the scale
			this.max = helpers.max(this.ticks);
			this.min = helpers.min(this.ticks);

			if (this.options.reverse) {
				this.ticks.reverse();

				this.start = this.max;
				this.end = this.min;
			} else {
				this.start = this.min;
				this.end = this.max;
			}
		},
		buildLabels: function() {
			// We assume that this has been run after ticks have been generated. We try to figure out
			// a label for each tick. 
			this.labels = [];

			helpers.each(this.ticks, function(tick, index, ticks) {
				var label;

				if (this.options.labels.userCallback) {
					// If the user provided a callback for label generation, use that as first priority
					label = this.options.labels.userCallback(tick, index, ticks);
				} else if (this.options.labels.template) {
					// else fall back to the template string
					label = helpers.template(this.options.labels.template, {
						value: tick
					});
				}

				this.labels.push(label); // empty string will not render so we're good
			}, this);
		},
		// Get the correct value. If the value type is object get the x or y based on whether we are horizontal or not
		getRightValue: function(rawValue) {
			return typeof rawValue === "object" ? (this.isHorizontal() ? rawValue.x : rawValue.y) : rawValue;
		},
		getPixelForValue: function(value) {
			// This must be called after fit has been run so that 
			//      this.left, this.top, this.right, and this.bottom have been defined
			var pixel;
			var range = helpers.log10(this.end) - helpers.log10(this.start);

			if (this.isHorizontal()) {
				if (value === 0) {
					pixel = this.left + this.paddingLeft;
				} else {
					var innerWidth = this.width - (this.paddingLeft + this.paddingRight);
					pixel = this.left + (innerWidth / range * (helpers.log10(value) - helpers.log10(this.start)));
					pixel += this.paddingLeft;
				}
			} else {
				// Bottom - top since pixels increase downard on a screen
				if (value === 0) {
					pixel = this.top + this.paddingTop;
				} else  {
					var innerHeight = this.height - (this.paddingTop + this.paddingBottom);
					pixel = (this.bottom - this.paddingBottom) - (innerHeight / range * (helpers.log10(value) - helpers.log10(this.start)));
				}
			}

			return pixel;
		},

		// Functions needed for line charts
		calculateRange: function() {
			this.min = null;
			this.max = null;

			var values = [];

			if (this.options.stacked) {
				helpers.each(this.data.datasets, function(dataset) {
					if (this.isHorizontal() ? dataset.xAxisID === this.id : dataset.yAxisID === this.id) {
						helpers.each(dataset.data, function(rawValue, index) {

							var value = this.getRightValue(rawValue);

							values[index] = values[index] || 0;

							if (this.options.relativePoints) {
								values[index] = 100;
							} else {
								// Don't need to split positive and negative since the log scale can't handle a 0 crossing
								values[index] += value;
							}
						}, this);
					}
				}, this);

				this.min = helpers.min(values);
				this.max = helpers.max(values);

			} else {
				helpers.each(this.data.datasets, function(dataset) {
					if (this.isHorizontal() ? dataset.xAxisID === this.id : dataset.yAxisID === this.id) {
						helpers.each(dataset.data, function(rawValue, index) {
							var value = this.getRightValue(rawValue);

							if (this.min === null) {
								this.min = value;
							} else if (value < this.min) {
								this.min = value;
							}

							if (this.max === null) {
								this.max = value;
							} else if (value > this.max) {
								this.max = value;
							}
						}, this);
					}
				}, this);
			}

			if (this.min === this.max) {
				if (this.min !== 0 && this.min !== null) {
					this.min = Math.pow(10, Math.floor(helpers.log10(this.min)) - 1);
					this.max = Math.pow(10, Math.floor(helpers.log10(this.max)) + 1);
				} else {
					this.min = 1;
					this.max = 10;
				}
			}
		},

		getPointPixelForValue: function(rawValue, index, datasetIndex) {
			var value = this.getRightValue(rawValue);

			if (this.options.stacked) {
				var offsetPos = 0;
				var offsetNeg = 0;

				for (var i = this.data.datasets.length - 1; i > datasetIndex; --i) {
					if (this.data.datasets[i].data[index] < 0) {
						offsetNeg += this.data.datasets[i].data[index];
					} else {
						offsetPos += this.data.datasets[i].data[index];
					}
				}

				if (value < 0) {
					return this.getPixelForValue(offsetNeg + value);
				} else {
					return this.getPixelForValue(offsetPos + value);
				}
			} else {
				return this.getPixelForValue(value);
			}
		},

		// Functions needed for bar charts
		calculateBarBase: function(datasetIndex, index) {
			var base = 0;

			if (this.options.stacked) {

				var value = this.data.datasets[datasetIndex].data[index];

				for (var j = 0; j < datasetIndex; j++) {
					if (this.data.datasets[j].yAxisID === this.id) {
						base += this.data.datasets[j].data[index];
					}
				}

				return this.getPixelForValue(base);
			}

			base = this.getPixelForValue(this.min);

			if (this.min < 0 && this.max < 0) {
				// All values are negative. Use the top as the base
				base = this.getPixelForValue(this.max);
			}

			return base;

		},
		calculateBarY: function(datasetIndex, index) {
			var value = this.data.datasets[datasetIndex].data[index];

			if (this.options.stacked) {

				var sumPos = 0,
					sumNeg = 0;

				for (var i = 0; i < datasetIndex; i++) {
					if (this.data.datasets[i].data[index] < 0) {
						sumNeg += this.data.datasets[i].data[index] || 0;
					} else {
						sumPos += this.data.datasets[i].data[index] || 0;
					}
				}

				if (value < 0) {
					return this.getPixelForValue(sumNeg + value);
				} else {
					return this.getPixelForValue(sumPos + value);
				}

				return this.getPixelForValue(value);
			}

			var offset = 0;

			for (var j = datasetIndex; j < this.data.datasets.length; j++) {
				if (j === datasetIndex && value) {
					offset += value;
				} else {
					offset = offset + value;
				}
			}

			return this.getPixelForValue(value);
		},

		// Fit this axis to the given size
		// @param {number} maxWidth : the max width the axis can be
		// @param {number} maxHeight: the max height the axis can be
		// @return {object} minSize : the minimum size needed to draw the axis
		fit: function(maxWidth, maxHeight, margins) {
			this.calculateRange();
			this.generateTicks(maxWidth, maxHeight);
			this.buildLabels();

			var minSize = {
				width: 0,
				height: 0,
			};

			// In a horizontal axis, we need some room for the scale to be drawn
			//
			//      -----------------------------------------------------
			//          |           |           |           |           |
			//
			// In a vertical axis, we need some room for the scale to be drawn.
			// The actual grid lines will be drawn on the chart area, however, we need to show 
			// ticks where the axis actually is.
			// We will allocate 25px for this width
			//      |
			//     -|
			//      |
			//      |
			//     -|
			//      |
			//      |
			//     -|


			// Width
			if (this.isHorizontal()) {
				minSize.width = maxWidth; // fill all the width
			} else {
				minSize.width = this.options.gridLines.show && this.options.display ? 10 : 0;
			}

			// height
			if (this.isHorizontal()) {
				minSize.height = this.options.gridLines.show && this.options.display ? 10 : 0;
			} else {
				minSize.height = maxHeight; // fill all the height
			}

			// Are we showing a label for the scale?
			if (this.options.scaleLabel.show) {
				if (this.isHorizontal()) {
					minSize.height += (this.options.scaleLabel.fontSize * 1.5);
				} else {
					minSize.width += (this.options.scaleLabel.fontSize * 1.5);
				}
			}

			this.paddingLeft = 0;
			this.paddingRight = 0;
			this.paddingTop = 0;
			this.paddingBottom = 0;


			if (this.options.labels.show && this.options.display) {
				// Don't bother fitting the labels if we are not showing them
				var labelFont = helpers.fontString(this.options.labels.fontSize,
					this.options.labels.fontStyle, this.options.labels.fontFamily);

				if (this.isHorizontal()) {
					// A horizontal axis is more constrained by the height.
					var maxLabelHeight = maxHeight - minSize.height;
					var labelHeight = 1.5 * this.options.labels.fontSize;
					minSize.height = Math.min(maxHeight, minSize.height + labelHeight);

					var labelFont = helpers.fontString(this.options.labels.fontSize, this.options.labels.fontStyle, this.options.labels.fontFamily);
					this.ctx.font = labelFont;

					var firstLabelWidth = this.ctx.measureText(this.labels[0]).width;
					var lastLabelWidth = this.ctx.measureText(this.labels[this.labels.length - 1]).width;

					// Ensure that our labels are always inside the canvas
					this.paddingLeft = firstLabelWidth / 2;
					this.paddingRight = lastLabelWidth / 2;
				} else {
					// A vertical axis is more constrained by the width. Labels are the dominant factor 
					// here, so get that length first
					var maxLabelWidth = maxWidth - minSize.width;
					var largestTextWidth = helpers.longestText(this.ctx, labelFont, this.labels);

					if (largestTextWidth < maxLabelWidth) {
						// We don't need all the room
						minSize.width += largestTextWidth;
						minSize.width += 3; // extra padding
					} else {
						// Expand to max size
						minSize.width = maxWidth;
					}

					this.paddingTop = this.options.labels.fontSize / 2;
					this.paddingBottom = this.options.labels.fontSize / 2;
				}
			}

			if (margins) {
				this.paddingLeft -= margins.left;
				this.paddingTop -= margins.top;
				this.paddingRight -= margins.right;
				this.paddingBottom -= margins.bottom;

				this.paddingLeft = Math.max(this.paddingLeft, 0);
				this.paddingTop = Math.max(this.paddingTop, 0);
				this.paddingRight = Math.max(this.paddingRight, 0);
				this.paddingBottom = Math.max(this.paddingBottom, 0);
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
				var hasZero;

				// Make sure we draw text in the correct color
				this.ctx.fillStyle = this.options.labels.fontColor;

				if (this.isHorizontal()) {
					if (this.options.gridLines.show) {
						// Draw the horizontal line
						setContextLineSettings = true;
						hasZero = helpers.findNextWhere(this.ticks, function(tick) {
							return tick === 0;
						}) !== undefined;
						var yTickStart = this.options.position == "bottom" ? this.top : this.bottom - 5;
						var yTickEnd = this.options.position == "bottom" ? this.top + 5 : this.bottom;

						helpers.each(this.ticks, function(tick, index) {
							// Grid lines are vertical
							var xValue = this.getPixelForValue(tick);

							if (this.labels[index] === null) {
								// If the user specifically hid the label by returning null from the label function, do so
								return;
							}

							if (tick === 0 || (!hasZero && index === 0)) {
								// Draw the 0 point specially or the left if there is no 0
								this.ctx.lineWidth = this.options.gridLines.zeroLineWidth;
								this.ctx.strokeStyle = this.options.gridLines.zeroLineColor;
								setContextLineSettings = true; // reset next time
							} else if (setContextLineSettings) {
								this.ctx.lineWidth = this.options.gridLines.lineWidth;
								this.ctx.strokeStyle = this.options.gridLines.color;
								setContextLineSettings = false;
							}

							xValue += helpers.aliasPixel(this.ctx.lineWidth);

							// Draw the label area
							this.ctx.beginPath();

							if (this.options.gridLines.drawTicks) {
								this.ctx.moveTo(xValue, yTickStart);
								this.ctx.lineTo(xValue, yTickEnd);
							}

							// Draw the chart area
							if (this.options.gridLines.drawOnChartArea) {
								this.ctx.moveTo(xValue, chartArea.top);
								this.ctx.lineTo(xValue, chartArea.bottom);
							}

							// Need to stroke in the loop because we are potentially changing line widths & colours
							this.ctx.stroke();
						}, this);
					}

					if (this.options.labels.show) {
						// Draw the labels

						var labelStartY;

						if (this.options.position == "top") {
							labelStartY = this.bottom - 10;
							this.ctx.textBaseline = "bottom";
						} else {
							// bottom side
							labelStartY = this.top + 10;
							this.ctx.textBaseline = "top";
						}

						this.ctx.textAlign = "center";
						this.ctx.font = helpers.fontString(this.options.labels.fontSize, this.options.labels.fontStyle, this.options.labels.fontFamily);

						helpers.each(this.labels, function(label, index) {
							var xValue = this.getPixelForValue(this.ticks[index]);
							if (label) {
								this.ctx.fillText(label, xValue, labelStartY);
							}
						}, this);
					}

					if (this.options.scaleLabel.show) {
						// Draw the scale label
						this.ctx.textAlign = "center";
						this.ctx.textBaseline = 'middle';
						this.ctx.font = helpers.fontString(this.options.scaleLabel.fontSize, this.options.scaleLabel.fontStyle, this.options.scaleLabel.fontFamily);

						var scaleLabelX = this.left + ((this.right - this.left) / 2); // midpoint of the width
						var scaleLabelY = this.options.position == 'bottom' ? this.bottom - (this.options.scaleLabel.fontSize / 2) : this.top + (this.options.scaleLabel.fontSize / 2);

						this.ctx.fillText(this.options.scaleLabel.labelString, scaleLabelX, scaleLabelY);
					}
				} else {
					// Vertical
					if (this.options.gridLines.show) {

						// Draw the vertical line
						setContextLineSettings = true;
						hasZero = helpers.findNextWhere(this.ticks, function(tick) {
							return tick === 0;
						}) !== undefined;
						var xTickStart = this.options.position == "right" ? this.left : this.right - 5;
						var xTickEnd = this.options.position == "right" ? this.left + 5 : this.right;

						helpers.each(this.ticks, function(tick, index) {
							// Grid lines are horizontal
							var yValue = this.getPixelForValue(tick);

							if (tick === 0 || (!hasZero && index === 0)) {
								// Draw the 0 point specially or the bottom if there is no 0
								this.ctx.lineWidth = this.options.gridLines.zeroLineWidth;
								this.ctx.strokeStyle = this.options.gridLines.zeroLineColor;
								setContextLineSettings = true; // reset next time
							} else if (setContextLineSettings) {
								this.ctx.lineWidth = this.options.gridLines.lineWidth;
								this.ctx.strokeStyle = this.options.gridLines.color;
								setContextLineSettings = false; // use boolean to indicate that we only want to do this once
							}

							yValue += helpers.aliasPixel(this.ctx.lineWidth);

							// Draw the label area
							this.ctx.beginPath();

							if (this.options.gridLines.drawTicks) {
								this.ctx.moveTo(xTickStart, yValue);
								this.ctx.lineTo(xTickEnd, yValue);
							}

							// Draw the chart area
							if (this.options.gridLines.drawOnChartArea) {
								this.ctx.moveTo(chartArea.left, yValue);
								this.ctx.lineTo(chartArea.right, yValue);
							}

							this.ctx.stroke();
						}, this);
					}

					if (this.options.labels.show) {
						// Draw the labels

						var labelStartX;

						if (this.options.position == "left") {
							if (this.options.labels.mirror) {
								labelStartX = this.right + this.options.labels.padding;
								this.ctx.textAlign = "left";
							} else {
								labelStartX = this.right - this.options.labels.padding;
								this.ctx.textAlign = "right";
							}
						} else {
							// right side
							if (this.options.labels.mirror) {
								labelStartX = this.left - this.options.labels.padding;
								this.ctx.textAlign = "right";
							} else {
								labelStartX = this.left + this.options.labels.padding;
								this.ctx.textAlign = "left";
							}
						}

						this.ctx.textBaseline = "middle";
						this.ctx.font = helpers.fontString(this.options.labels.fontSize, this.options.labels.fontStyle, this.options.labels.fontFamily);

						helpers.each(this.labels, function(label, index) {
							var yValue = this.getPixelForValue(this.ticks[index]);
							this.ctx.fillText(label, labelStartX, yValue);
						}, this);
					}

					if (this.options.scaleLabel.show) {
						// Draw the scale label
						var scaleLabelX = this.options.position == 'left' ? this.left + (this.options.scaleLabel.fontSize / 2) : this.right - (this.options.scaleLabel.fontSize / 2);
						var scaleLabelY = this.top + ((this.bottom - this.top) / 2);
						var rotation = this.options.position == 'left' ? -0.5 * Math.PI : 0.5 * Math.PI;

						this.ctx.save();
						this.ctx.translate(scaleLabelX, scaleLabelY);
						this.ctx.rotate(rotation);
						this.ctx.textAlign = "center";
						this.ctx.font = helpers.fontString(this.options.scaleLabel.fontSize, this.options.scaleLabel.fontStyle, this.options.scaleLabel.fontFamily);
						this.ctx.textBaseline = 'middle';
						this.ctx.fillText(this.options.scaleLabel.labelString, 0, 0);
						this.ctx.restore();
					}
				}
			}
		}
	});
	Chart.scaleService.registerScaleType("logarithmic", LogarithmicScale, defaultConfig);

}).call(this);

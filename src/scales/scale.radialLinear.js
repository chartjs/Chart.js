(function() {
	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;

	var defaultConfig = {
		display: true,

		//Boolean - Whether to animate scaling the chart from the centre
		animate: true,

		lineArc: false,

		// grid line settings
		gridLines: {
			show: true,
			color: "rgba(0, 0, 0, 0.1)",
			lineWidth: 1,
		},

		angleLines: {
			show: true,
			color: "rgba(0,0,0, 0.1)",
			lineWidth: 1
		},

		// scale numbers
		beginAtZero: true,

		// label settings
		labels: {
			show: true,
			template: "<%=value.toLocaleString()%>",
			fontSize: 12,
			fontStyle: "normal",
			fontColor: "#666",
			fontFamily: "Helvetica Neue",

			//Boolean - Show a backdrop to the scale label
			showLabelBackdrop: true,

			//String - The colour of the label backdrop
			backdropColor: "rgba(255,255,255,0.75)",

			//Number - The backdrop padding above & below the label in pixels
			backdropPaddingY: 2,

			//Number - The backdrop padding to the side of the label in pixels
			backdropPaddingX: 2,
		},

		pointLabels: {
			//String - Point label font declaration
			fontFamily: "'Arial'",

			//String - Point label font weight
			fontStyle: "normal",

			//Number - Point label font size in pixels
			fontSize: 10,

			//String - Point label font colour
			fontColor: "#666",
		},
	};

	var LinearRadialScale = Chart.Element.extend({
		initialize: function() {
			this.height = this.chart.height;
			this.width = this.chart.width;
			this.xCenter = this.chart.width / 2;
			this.yCenter = this.chart.height / 2;
			this.size = helpers.min([this.height, this.width]);
			this.valuesCount = this.data.labels.length;
			this.labels = this.data.labels;
			this.drawingArea = (this.options.display) ? (this.size / 2) - (this.options.labels.fontSize / 2 + this.options.labels.backdropPaddingY) : (this.size / 2);
		},
		update: function() {
			if (!this.options.lineArc) {
				this.setScaleSize();
			} else {
				this.drawingArea = (this.options.display) ? (this.size / 2) - (this.fontSize / 2 + this.backdropPaddingY) : (this.size / 2);
			}

			this.buildYLabels();
		},
		calculateRange: function() {
			this.min = null;
			this.max = null;

			helpers.each(this.data.datasets, function(dataset) {
				helpers.each(dataset.data, function(value, index) {
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
			}, this);
		},
		generateTicks: function() {
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
					ticks.push(value);
				}
			} else {
				// Figure out what the max number of ticks we can support it is based on the size of
				// the axis area. For now, we say that the minimum tick spacing in pixels must be 50
				// We also limit the maximum number of ticks to 11 which gives a nice 10 squares on 
				// the graph

				var maxTicks = Math.min(11, Math.ceil(this.drawingArea / (2 * this.options.labels.fontSize)));

				// Make sure we always have at least 2 ticks 
				maxTicks = Math.max(2, maxTicks);

				// To get a "nice" value for the tick spacing, we will use the appropriately named 
				// "nice number" algorithm. See http://stackoverflow.com/questions/8506881/nice-label-algorithm-for-charts-with-minimum-ticks
				// for details.

				// If we are forcing it to begin at 0, but 0 will already be rendered on the chart,
				// do nothing since that would make the chart weird. If the user really wants a weird chart
				// axis, they can manually override it
				if (this.options.beginAtZero) {
					var minSign = helpers.sign(this.min);
					var maxSign = helpers.sign(this.max);

					if (minSign < 0 && maxSign < 0) {
						// move the top up to 0
						this.max = 0;
					} else if (minSign > 0 && maxSign > 0) {
						// move the botttom down to 0
						this.min = 0;
					}
				}

				var niceRange = helpers.niceNum(this.max - this.min, false);
				var spacing = helpers.niceNum(niceRange / (maxTicks - 1), true);
				var niceMin = Math.floor(this.min / spacing) * spacing;
				var niceMax = Math.ceil(this.max / spacing) * spacing;

				// Put the values into the ticks array
				for (var j = niceMin; j <= niceMax; j += spacing) {
					this.ticks.push(j);
				}
			}

			if (this.options.position == "left" || this.options.position == "right") {
				// We are in a vertical orientation. The top value is the highest. So reverse the array
				this.ticks.reverse();
			}

			// At this point, we need to update our max and min given the tick values since we have expanded the
			// range of the scale
			this.max = helpers.max(this.ticks);
			this.min = helpers.min(this.ticks);
		},
		buildYLabels: function() {
			this.yLabels = [];

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

				this.yLabels.push(label ? label : "");
			}, this);
		},
		getCircumference: function() {
			return ((Math.PI * 2) / this.valuesCount);
		},
		setScaleSize: function() {
			/*
			 * Right, this is really confusing and there is a lot of maths going on here
			 * The gist of the problem is here: https://gist.github.com/nnnick/696cc9c55f4b0beb8fe9
			 *
			 * Reaction: https://dl.dropboxusercontent.com/u/34601363/toomuchscience.gif
			 *
			 * Solution:
			 *
			 * We assume the radius of the polygon is half the size of the canvas at first
			 * at each index we check if the text overlaps.
			 *
			 * Where it does, we store that angle and that index.
			 *
			 * After finding the largest index and angle we calculate how much we need to remove
			 * from the shape radius to move the point inwards by that x.
			 *
			 * We average the left and right distances to get the maximum shape radius that can fit in the box
			 * along with labels.
			 *
			 * Once we have that, we can find the centre point for the chart, by taking the x text protrusion
			 * on each side, removing that from the size, halving it and adding the left x protrusion width.
			 *
			 * This will mean we have a shape fitted to the canvas, as large as it can be with the labels
			 * and position it in the most space efficient manner
			 *
			 * https://dl.dropboxusercontent.com/u/34601363/yeahscience.gif
			 */


			// Get maximum radius of the polygon. Either half the height (minus the text width) or half the width.
			// Use this to calculate the offset + change. - Make sure L/R protrusion is at least 0 to stop issues with centre points
			var largestPossibleRadius = helpers.min([(this.height / 2 - this.options.pointLabels.fontSize - 5), this.width / 2]),
				pointPosition,
				i,
				textWidth,
				halfTextWidth,
				furthestRight = this.width,
				furthestRightIndex,
				furthestRightAngle,
				furthestLeft = 0,
				furthestLeftIndex,
				furthestLeftAngle,
				xProtrusionLeft,
				xProtrusionRight,
				radiusReductionRight,
				radiusReductionLeft,
				maxWidthRadius;
			this.ctx.font = helpers.fontString(this.options.pointLabels.fontSize, this.options.pointLabels.fontStyle, this.options.pointLabels.fontFamily);
			for (i = 0; i < this.valuesCount; i++) {
				// 5px to space the text slightly out - similar to what we do in the draw function.
				pointPosition = this.getPointPosition(i, largestPossibleRadius);
				textWidth = this.ctx.measureText(helpers.template(this.options.labels.template, {
					value: this.labels[i]
				})).width + 5;
				if (i === 0 || i === this.valuesCount / 2) {
					// If we're at index zero, or exactly the middle, we're at exactly the top/bottom
					// of the radar chart, so text will be aligned centrally, so we'll half it and compare
					// w/left and right text sizes
					halfTextWidth = textWidth / 2;
					if (pointPosition.x + halfTextWidth > furthestRight) {
						furthestRight = pointPosition.x + halfTextWidth;
						furthestRightIndex = i;
					}
					if (pointPosition.x - halfTextWidth < furthestLeft) {
						furthestLeft = pointPosition.x - halfTextWidth;
						furthestLeftIndex = i;
					}
				} else if (i < this.valuesCount / 2) {
					// Less than half the values means we'll left align the text
					if (pointPosition.x + textWidth > furthestRight) {
						furthestRight = pointPosition.x + textWidth;
						furthestRightIndex = i;
					}
				} else if (i > this.valuesCount / 2) {
					// More than half the values means we'll right align the text
					if (pointPosition.x - textWidth < furthestLeft) {
						furthestLeft = pointPosition.x - textWidth;
						furthestLeftIndex = i;
					}
				}
			}

			xProtrusionLeft = furthestLeft;

			xProtrusionRight = Math.ceil(furthestRight - this.width);

			furthestRightAngle = this.getIndexAngle(furthestRightIndex);

			furthestLeftAngle = this.getIndexAngle(furthestLeftIndex);

			radiusReductionRight = xProtrusionRight / Math.sin(furthestRightAngle + Math.PI / 2);

			radiusReductionLeft = xProtrusionLeft / Math.sin(furthestLeftAngle + Math.PI / 2);

			// Ensure we actually need to reduce the size of the chart
			radiusReductionRight = (helpers.isNumber(radiusReductionRight)) ? radiusReductionRight : 0;
			radiusReductionLeft = (helpers.isNumber(radiusReductionLeft)) ? radiusReductionLeft : 0;

			this.drawingArea = largestPossibleRadius - (radiusReductionLeft + radiusReductionRight) / 2;

			//this.drawingArea = min([maxWidthRadius, (this.height - (2 * (this.pointLabelFontSize + 5)))/2])
			this.setCenterPoint(radiusReductionLeft, radiusReductionRight);

		},
		setCenterPoint: function(leftMovement, rightMovement) {

			var maxRight = this.width - rightMovement - this.drawingArea,
				maxLeft = leftMovement + this.drawingArea;

			this.xCenter = (maxLeft + maxRight) / 2;
			// Always vertically in the centre as the text height doesn't change
			this.yCenter = (this.height / 2);
		},

		getIndexAngle: function(index) {
			var angleMultiplier = (Math.PI * 2) / this.valuesCount;
			// Start from the top instead of right, so remove a quarter of the circle

			return index * angleMultiplier - (Math.PI / 2);
		},
		getDistanceFromCenterForValue: function(value) {
			// Take into account half font size + the yPadding of the top value
			var scalingFactor = this.drawingArea / (this.max - this.min);
			return (value - this.min) * scalingFactor;
		},
		getPointPosition: function(index, distanceFromCenter) {
			var thisAngle = this.getIndexAngle(index);
			return {
				x: (Math.cos(thisAngle) * distanceFromCenter) + this.xCenter,
				y: (Math.sin(thisAngle) * distanceFromCenter) + this.yCenter
			};
		},
		getPointPositionForValue: function(index, value) {
			return this.getPointPosition(index, this.getDistanceFromCenterForValue(value));
		},
		draw: function() {
			if (this.options.display) {
				var ctx = this.ctx;
				helpers.each(this.yLabels, function(label, index) {
					// Don't draw a centre value
					if (index > 0) {
						var yCenterOffset = this.getDistanceFromCenterForValue(this.ticks[index]);
						var yHeight = this.yCenter - yCenterOffset;

						// Draw circular lines around the scale
						if (this.options.gridLines.show) {
							ctx.strokeStyle = this.options.gridLines.color;
							ctx.lineWidth = this.options.gridLines.lineWidth;

							if (this.options.lineArc) {
								// Draw circular arcs between the points
								ctx.beginPath();
								ctx.arc(this.xCenter, this.yCenter, yCenterOffset, 0, Math.PI * 2);
								ctx.closePath();
								ctx.stroke();
							} else {
								// Draw straight lines connecting each index
								ctx.beginPath();
								for (var i = 0; i < this.valuesCount; i++) {
									var pointPosition = this.getPointPosition(i, this.getDistanceFromCenterForValue(this.ticks[index]));
									if (i === 0) {
										ctx.moveTo(pointPosition.x, pointPosition.y);
									} else {
										ctx.lineTo(pointPosition.x, pointPosition.y);
									}
								}
								ctx.closePath();
								ctx.stroke();
							}
						}

						if (this.options.labels.show) {
							ctx.font = helpers.fontString(this.options.labels.fontSize, this.options.labels.fontStyle, this.options.labels.fontFamily);

							if (this.options.labels.showLabelBackdrop) {
								var labelWidth = ctx.measureText(label).width;
								ctx.fillStyle = this.options.labels.backdropColor;
								ctx.fillRect(
									this.xCenter - labelWidth / 2 - this.options.labels.backdropPaddingX,
									yHeight - this.fontSize / 2 - this.options.labels.backdropPaddingY,
									labelWidth + this.options.labels.backdropPaddingX * 2,
									this.options.labels.fontSize + this.options.labels.backdropPaddingY * 2
								);
							}

							ctx.textAlign = 'center';
							ctx.textBaseline = "middle";
							ctx.fillStyle = this.options.labels.fontColor;
							ctx.fillText(label, this.xCenter, yHeight);
						}
					}
				}, this);

				if (!this.options.lineArc) {
					ctx.lineWidth = this.options.angleLines.lineWidth;
					ctx.strokeStyle = this.options.angleLines.color;

					for (var i = this.valuesCount - 1; i >= 0; i--) {
						if (this.options.angleLines.show) {
							var outerPosition = this.getPointPosition(i, this.getDistanceFromCenterForValue(this.max));
							ctx.beginPath();
							ctx.moveTo(this.xCenter, this.yCenter);
							ctx.lineTo(outerPosition.x, outerPosition.y);
							ctx.stroke();
							ctx.closePath();
						}
						// Extra 3px out for some label spacing
						var pointLabelPosition = this.getPointPosition(i, this.getDistanceFromCenterForValue(this.max) + 5);
						ctx.font = helpers.fontString(this.options.pointLabels.fontSize, this.options.pointLabels.fontStyle, this.options.pointLabels.fontFamily);
						ctx.fillStyle = this.options.pointLabels.fontColor;

						var labelsCount = this.labels.length,
							halfLabelsCount = this.labels.length / 2,
							quarterLabelsCount = halfLabelsCount / 2,
							upperHalf = (i < quarterLabelsCount || i > labelsCount - quarterLabelsCount),
							exactQuarter = (i === quarterLabelsCount || i === labelsCount - quarterLabelsCount);
						if (i === 0) {
							ctx.textAlign = 'center';
						} else if (i === halfLabelsCount) {
							ctx.textAlign = 'center';
						} else if (i < halfLabelsCount) {
							ctx.textAlign = 'left';
						} else {
							ctx.textAlign = 'right';
						}

						// Set the correct text baseline based on outer positioning
						if (exactQuarter) {
							ctx.textBaseline = 'middle';
						} else if (upperHalf) {
							ctx.textBaseline = 'bottom';
						} else {
							ctx.textBaseline = 'top';
						}

						ctx.fillText(this.labels[i], pointLabelPosition.x, pointLabelPosition.y);
					}
				}
			}
		}
	});
	Chart.scaleService.registerScaleType("radialLinear", LinearRadialScale, defaultConfig);


}).call(this);

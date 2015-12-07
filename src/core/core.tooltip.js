(function() {

	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;

	Chart.defaults.global.tooltips = {
		enabled: true,
		custom: null,
		mode: 'single',
		backgroundColor: "rgba(0,0,0,0.8)",
		titleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
		titleFontSize: 12,
		titleFontStyle: "bold",
		titleSpacing: 2,
		titleMarginBottom: 6,
		titleColor: "#fff",
		titleAlign: "left",
		bodyFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
		bodyFontSize: 12,
		bodyFontStyle: "normal",
		bodySpacing: 2,
		bodyColor: "#fff",
		bodyAlign: "left",
		footerFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
		footerFontSize: 12,
		footerFontStyle: "bold",
		footerSpacing: 2,
		footerMarginTop: 6,
		footerColor: "#fff",
		footerAlign: "left",
		yPadding: 6,
		xPadding: 6,
		caretSize: 5,
		cornerRadius: 6,
		multiKeyBackground: '#fff',
		callbacks: {
			// Args are: (tooltipItems, data)
			beforeTitle: helpers.noop,
			title: function(tooltipItems, data) {
				// Pick first xLabel for now
				var title = '';

				if (tooltipItems.length > 0) {
					if (tooltipItems[0].xLabel) {
						title = tooltipItems[0].xLabel;
					} else if (data.labels.length > 0 && tooltipItems[0].index < data.labels.length) {
						title = data.labels[tooltipItems[0].index];
					}
				}

				return title;
			},
			afterTitle: helpers.noop,

			// Args are: (tooltipItems, data)
			beforeBody: helpers.noop,

			// Args are: (tooltipItem, data)
			beforeLabel: helpers.noop,
			label: function(tooltipItem, data) {
				var datasetLabel = data.datasets[tooltipItem.datasetIndex].label || '';
				return datasetLabel + ': ' + tooltipItem.yLabel;
			},
			afterLabel: helpers.noop,

			// Args are: (tooltipItems, data)
			afterBody: helpers.noop,

			// Args are: (tooltipItems, data)
			beforeFooter: helpers.noop,
			footer: helpers.noop,
			afterFooter: helpers.noop,
		},
	};

	// Helper to push or concat based on if the 2nd parameter is an array or not
	function pushOrConcat(base, toPush) {
		if (toPush) {
			if (helpers.isArray(toPush)) {
				base = base.concat(toPush);
			} else {
				base.push(toPush);
			}
		}

		return base;
	}

	Chart.Tooltip = Chart.Element.extend({
		initialize: function() {
			var options = this._options;
			helpers.extend(this, {
				_model: {
					// Positioning
					xPadding: options.tooltips.xPadding,
					yPadding: options.tooltips.yPadding,

					// Body
					bodyColor: options.tooltips.bodyColor,
					_bodyFontFamily: options.tooltips.bodyFontFamily,
					_bodyFontStyle: options.tooltips.bodyFontStyle,
					_bodyAlign: options.tooltips.bodyAlign,
					bodyFontSize: options.tooltips.bodyFontSize,
					bodySpacing: options.tooltips.bodySpacing,

					// Title
					titleColor: options.tooltips.titleColor,
					_titleFontFamily: options.tooltips.titleFontFamily,
					_titleFontStyle: options.tooltips.titleFontStyle,
					titleFontSize: options.tooltips.titleFontSize,
					_titleAlign: options.tooltips.titleAlign,
					titleSpacing: options.tooltips.titleSpacing,
					titleMarginBottom: options.tooltips.titleMarginBottom,

					// Footer
					footerColor: options.tooltips.footerColor,
					_footerFontFamily: options.tooltips.footerFontFamily,
					_footerFontStyle: options.tooltips.footerFontStyle,
					footerFontSize: options.tooltips.footerFontSize,
					_footerAlign: options.tooltips.footerAlign,
					footerSpacing: options.tooltips.footerSpacing,
					footerMarginTop: options.tooltips.footerMarginTop,

					// Appearance
					caretSize: options.tooltips.caretSize,
					cornerRadius: options.tooltips.cornerRadius,
					backgroundColor: options.tooltips.backgroundColor,
					opacity: 0,
					legendColorBackground: options.tooltips.multiKeyBackground,
				},
			});
		},

		// Get the title
		// Args are: (tooltipItem, data)
		getTitle: function() {
			var beforeTitle = this._options.tooltips.callbacks.beforeTitle.apply(this, arguments),
				title = this._options.tooltips.callbacks.title.apply(this, arguments),
				afterTitle = this._options.tooltips.callbacks.afterTitle.apply(this, arguments);

			var lines = [];
			lines = pushOrConcat(lines, beforeTitle);
			lines = pushOrConcat(lines, title);
			lines = pushOrConcat(lines, afterTitle);

			return lines;
		},

		// Args are: (tooltipItem, data)
		getBeforeBody: function() {
			var lines = this._options.tooltips.callbacks.beforeBody.apply(this, arguments);
			return helpers.isArray(lines) ? lines : [lines];
		},

		// Args are: (tooltipItem, data)
		getBody: function(tooltipItems, data) {
			var lines = [];

			helpers.each(tooltipItems, function(bodyItem) {
				var beforeLabel = this._options.tooltips.callbacks.beforeLabel.call(this, bodyItem, data) || '';
				var bodyLabel = this._options.tooltips.callbacks.label.call(this, bodyItem, data) || '';
				var afterLabel = this._options.tooltips.callbacks.afterLabel.call(this, bodyItem, data) || '';

				lines.push(beforeLabel + bodyLabel + afterLabel);
			}, this);

			return lines;
		},

		// Args are: (tooltipItem, data)
		getAfterBody: function() {
			var lines = this._options.tooltips.callbacks.afterBody.apply(this, arguments);
			return helpers.isArray(lines) ? lines : [lines];
		},

		// Get the footer and beforeFooter and afterFooter lines
		// Args are: (tooltipItem, data)
		getFooter: function() {
			var beforeFooter = this._options.tooltips.callbacks.beforeFooter.apply(this, arguments);
			var footer = this._options.tooltips.callbacks.footer.apply(this, arguments);
			var afterFooter = this._options.tooltips.callbacks.afterFooter.apply(this, arguments);

			var lines = [];
			lines = pushOrConcat(lines, beforeFooter);
			lines = pushOrConcat(lines, footer);
			lines = pushOrConcat(lines, afterFooter);

			return lines;
		},

		getAveragePosition: function(elements){

			if(!elements.length){
				return false;
			}

			var xPositions = [];
			var yPositions = [];

			helpers.each(elements, function(el){
				if(el) {
					var pos = el.tooltipPosition();
					xPositions.push(pos.x);
					yPositions.push(pos.y);
				}
			});

			var x = 0, y = 0;
			for (var i = 0; i < xPositions.length; i++) {
				x += xPositions[i];
				y += yPositions[i];
			}

			return {
				x: Math.round(x / xPositions.length),
				y: Math.round(y / xPositions.length)
			};

		},

		update: function(changed) {
			if (this._active.length){
				this._model.opacity = 1;

				var element = this._active[0],
					labelColors = [],
					tooltipPosition;

				var tooltipItems = [];

				if (this._options.tooltips.mode === 'single') {
					var yScale = element._yScale || element._scale; // handle radar || polarArea charts
					tooltipItems.push({
						xLabel: element._xScale ? element._xScale.getLabelForIndex(element._index, element._datasetIndex) : '',
						yLabel: yScale ? yScale.getLabelForIndex(element._index, element._datasetIndex) : '',
						index: element._index,
						datasetIndex: element._datasetIndex,
					});
					tooltipPosition = this.getAveragePosition(this._active);
				} else {
					helpers.each(this._data.datasets, function(dataset, datasetIndex) {
						if (!helpers.isDatasetVisible(dataset)) {
							return;
						}
						var currentElement = dataset.metaData[element._index];
						if (currentElement) {
							var yScale = element._yScale || element._scale; // handle radar || polarArea charts

							tooltipItems.push({
								xLabel: currentElement._xScale ? currentElement._xScale.getLabelForIndex(currentElement._index, currentElement._datasetIndex) : '',
								yLabel: yScale ? yScale.getLabelForIndex(currentElement._index, currentElement._datasetIndex) : '',
								index: element._index,
								datasetIndex: datasetIndex,
							});
						}
					});

					helpers.each(this._active, function(active) {
						if (active) {
						  labelColors.push({
						  	borderColor: active._view.borderColor,
						  	backgroundColor: active._view.backgroundColor
						  });
						}
					}, this);

					tooltipPosition = this.getAveragePosition(this._active);
					tooltipPosition.y = this._active[0]._yScale.getPixelForDecimal(0.5);
				}

				// Build the Text Lines
				helpers.extend(this._model, {
					title: this.getTitle(tooltipItems, this._data),
					beforeBody: this.getBeforeBody(tooltipItems, this._data),
					body: this.getBody(tooltipItems, this._data),
					afterBody: this.getAfterBody(tooltipItems, this._data),
					footer: this.getFooter(tooltipItems, this._data),
				});

				helpers.extend(this._model, {
					x: Math.round(tooltipPosition.x),
					y: Math.round(tooltipPosition.y),
					caretPadding: tooltipPosition.padding,
					labelColors: labelColors,
				});
			}
			else{
				this._model.opacity = 0;
			}

			if (changed && this._options.tooltips.custom) {
				this._options.tooltips.custom.call(this, this._model);
			}

			return this;
		},
		draw: function() {


			var ctx = this._chart.ctx;
			var vm = this._view;

			if (this._view.opacity === 0) {
				return;
			}

			// Get Dimensions

			vm.position = "top";

			var caretPadding = vm.caretPadding || 2;

			var combinedBodyLength = vm.body.length + vm.beforeBody.length + vm.afterBody.length;

			// Height
			var tooltipHeight = vm.yPadding * 2; // Tooltip Padding

			tooltipHeight += vm.title.length * vm.titleFontSize; // Title Lines
			tooltipHeight += (vm.title.length - 1) * vm.titleSpacing; // Title Line Spacing
			tooltipHeight += vm.title.length ? vm.titleMarginBottom : 0; // Title's bottom Margin

			tooltipHeight += combinedBodyLength * vm.bodyFontSize; // Body Lines
			tooltipHeight += (combinedBodyLength - 1) * vm.bodySpacing; // Body Line Spacing

			tooltipHeight += vm.footer.length ? vm.footerMarginTop : 0; // Footer Margin
			tooltipHeight += vm.footer.length * (vm.footerFontSize); // Footer Lines
			tooltipHeight += (vm.footer.length - 1) * vm.footerSpacing; // Footer Line Spacing

			// Width
			var tooltipWidth = 0;
			helpers.each(vm.title, function(line) {
				ctx.font = helpers.fontString(vm.titleFontSize, vm._titleFontStyle, vm._titleFontFamily);
				tooltipWidth = Math.max(tooltipWidth, ctx.measureText(line).width);
			});
			helpers.each(vm.body, function(line) {
				ctx.font = helpers.fontString(vm.bodyFontSize, vm._bodyFontStyle, vm._bodyFontFamily);
				tooltipWidth = Math.max(tooltipWidth, ctx.measureText(line).width + (this._options.tooltips.mode !== 'single' ? (vm.bodyFontSize + 2) : 0));
			}, this);
			helpers.each(vm.footer, function(line) {
				ctx.font = helpers.fontString(vm.footerFontSize, vm._footerFontStyle, vm._footerFontFamily);
				tooltipWidth = Math.max(tooltipWidth, ctx.measureText(line).width);
			});
			tooltipWidth += 2 * vm.xPadding;
			var tooltipTotalWidth = tooltipWidth + vm.caretSize + caretPadding;



			// Smart Tooltip placement to stay on the canvas
			// Top, center, or bottom
			vm.yAlign = "center";
			if (vm.y - (tooltipHeight / 2) < 0) {
				vm.yAlign = "top";
			} else if (vm.y + (tooltipHeight / 2) > this._chart.height) {
				vm.yAlign = "bottom";
			}


			// Left or Right
			vm.xAlign = "right";
			if (vm.x + tooltipTotalWidth > this._chart.width) {
				vm.xAlign = "left";
			}


			// Background Position
			var tooltipX = vm.x,
				tooltipY = vm.y;

			if (vm.yAlign === 'top') {
				tooltipY = vm.y - vm.caretSize - vm.cornerRadius;
			} else if (vm.yAlign === 'bottom') {
				tooltipY = vm.y - tooltipHeight + vm.caretSize + vm.cornerRadius;
			} else {
				tooltipY = vm.y - (tooltipHeight / 2);
			}

			if (vm.xAlign === 'left') {
				tooltipX = vm.x - tooltipTotalWidth;
			} else if (vm.xAlign === 'right') {
				tooltipX = vm.x + caretPadding + vm.caretSize;
			} else {
				tooltipX = vm.x + (tooltipTotalWidth / 2);
			}

			// Draw Background

			// IE11/Edge does not like very small opacities, so snap to 0
			var opacity = Math.abs(vm.opacity < 1e-3) ? 0 : vm.opacity;

			if (this._options.tooltips.enabled) {
				ctx.fillStyle = helpers.color(vm.backgroundColor).alpha(opacity).rgbString();
				helpers.drawRoundedRectangle(ctx, tooltipX, tooltipY, tooltipWidth, tooltipHeight, vm.cornerRadius);
				ctx.fill();
			}


			// Draw Caret
			if (this._options.tooltips.enabled) {
				ctx.fillStyle = helpers.color(vm.backgroundColor).alpha(opacity).rgbString();

				if (vm.xAlign === 'left') {

					ctx.beginPath();
					ctx.moveTo(vm.x - caretPadding, vm.y);
					ctx.lineTo(vm.x - caretPadding - vm.caretSize, vm.y - vm.caretSize);
					ctx.lineTo(vm.x - caretPadding - vm.caretSize, vm.y + vm.caretSize);
					ctx.closePath();
					ctx.fill();
				} else {
					ctx.beginPath();
					ctx.moveTo(vm.x + caretPadding, vm.y);
					ctx.lineTo(vm.x + caretPadding + vm.caretSize, vm.y - vm.caretSize);
					ctx.lineTo(vm.x + caretPadding + vm.caretSize, vm.y + vm.caretSize);
					ctx.closePath();
					ctx.fill();
				}
			}

			// Draw Title, Body, and Footer

			if (this._options.tooltips.enabled) {

				var yBase = tooltipY + vm.yPadding;
				var xBase = tooltipX + vm.xPadding;

				// Titles

				if (vm.title.length) {
					ctx.textAlign = vm._titleAlign;
					ctx.textBaseline = "top";
					ctx.fillStyle = helpers.color(vm.titleColor).alpha(opacity).rgbString();
					ctx.font = helpers.fontString(vm.titleFontSize, vm._titleFontStyle, vm._titleFontFamily);

					helpers.each(vm.title, function(title, i) {
						ctx.fillText(title, xBase, yBase);
						yBase += vm.titleFontSize + vm.titleSpacing; // Line Height and spacing
						if (i + 1 === vm.title.length) {
							yBase += vm.titleMarginBottom - vm.titleSpacing; // If Last, add margin, remove spacing
						}
					}, this);
				}


				// Body
				ctx.textAlign = vm._bodyAlign;
				ctx.textBaseline = "top";
				ctx.fillStyle = helpers.color(vm.bodyColor).alpha(opacity).rgbString();
				ctx.font = helpers.fontString(vm.bodyFontSize, vm._bodyFontStyle, vm._bodyFontFamily);

				// Before Body
				helpers.each(vm.beforeBody, function(beforeBody) {
					ctx.fillText(beforeBody, xBase, yBase);
					yBase += vm.bodyFontSize + vm.bodySpacing;
				});

				helpers.each(vm.body, function(body, i) {


					// Draw Legend-like boxes if needed
					if (this._options.tooltips.mode !== 'single') {
						// Fill a white rect so that colours merge nicely if the opacity is < 1
						ctx.fillStyle = helpers.color(vm.legendColorBackground).alpha(opacity).rgbaString();
						ctx.fillRect(xBase, yBase, vm.bodyFontSize, vm.bodyFontSize);

						// Border
						ctx.strokeStyle = helpers.color(vm.labelColors[i].borderColor).alpha(opacity).rgbaString();
						ctx.strokeRect(xBase, yBase, vm.bodyFontSize, vm.bodyFontSize);

						// Inner square
						ctx.fillStyle = helpers.color(vm.labelColors[i].backgroundColor).alpha(opacity).rgbaString();
						ctx.fillRect(xBase + 1, yBase + 1, vm.bodyFontSize - 2, vm.bodyFontSize - 2);

						ctx.fillStyle = helpers.color(vm.bodyColor).alpha(opacity).rgbaString(); // Return fill style for text
					}

					// Body Line
					ctx.fillText(body, xBase + (this._options.tooltips.mode !== 'single' ? (vm.bodyFontSize + 2) : 0), yBase);

					yBase += vm.bodyFontSize + vm.bodySpacing;

				}, this);

				// After Body
				helpers.each(vm.afterBody, function(afterBody) {
					ctx.fillText(afterBody, xBase, yBase);
					yBase += vm.bodyFontSize;
				});

				yBase -= vm.bodySpacing; // Remove last body spacing


				// Footer
				if (vm.footer.length) {

					yBase += vm.footerMarginTop;

					ctx.textAlign = vm._footerAlign;
					ctx.textBaseline = "top";
					ctx.fillStyle = helpers.color(vm.footerColor).alpha(opacity).rgbString();
					ctx.font = helpers.fontString(vm.footerFontSize, vm._footerFontStyle, vm._footerFontFamily);

					helpers.each(vm.footer, function(footer) {
						ctx.fillText(footer, xBase, yBase);
						yBase += vm.footerFontSize + vm.footerSpacing;
					}, this);
				}

			}
		},
	});

}).call(this);

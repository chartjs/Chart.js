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
		titleColor: "#fff",
		titleAlign: "left",
		bodyFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
		bodyFontSize: 12,
		bodyFontStyle: "normal",
		bodyColor: "#fff",
		bodyAlign: "left",
		footerFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
		footerFontSize: 12,
		footerFontStyle: "bold",
		footerColor: "#fff",
		footerAlign: "left",
		yPadding: 6,
		xPadding: 6,
		caretSize: 5,
		cornerRadius: 6,
		xOffset: 10,
		multiKeyBackground: '#fff',
		callbacks: {
			beforeTitle: helpers.noop,
			title: function(xLabel, yLabel, index, datasetIndex, data) {
				return data.datasets[datasetIndex].label;
			},
			afterTitle: helpers.noop,

			beforeBody: helpers.noop,

			beforeLabel: helpers.noop,
			label: function(xLabel, yLabel, index, datasetIndex, data) {
				return xLabel + ': ' + yLabel;
			},
			afterLabel: helpers.noop,

			afterBody: helpers.noop,

			beforeFooter: helpers.noop,
			footer: helpers.noop,
			afterFooter: helpers.noop,
		},
	};

	Chart.Tooltip = Chart.Element.extend({
		initialize: function() {
			var options = this._options;
			helpers.extend(this, {
				_model: {
					// Positioning
					xPadding: options.tooltips.xPadding,
					yPadding: options.tooltips.yPadding,
					xOffset: options.tooltips.xOffset,

					// Body
					bodyColor: options.tooltips.bodyColor,
					_bodyFontFamily: options.tooltips.bodyFontFamily,
					_bodyFontStyle: options.tooltips.bodyFontStyle,
					bodyFontSize: options.tooltips.bodyFontSize,
					_bodposition: options.tooltips.bodposition,

					// Title
					titleColor: options.tooltips.titleColor,
					_titleFontFamily: options.tooltips.titleFontFamily,
					_titleFontStyle: options.tooltips.titleFontStyle,
					titleFontSize: options.tooltips.titleFontSize,
					_titleAlign: options.tooltips.titleAlign,

					// Footer
					footerColor: options.tooltips.footerColor,
					_footerFontFamily: options.tooltips.footerFontFamily,
					_footerFontStyle: options.tooltips.footerFontStyle,
					footerFontSize: options.tooltips.footerFontSize,
					_footerAlign: options.tooltips.footerAlign,

					// Appearance
					caretSize: options.tooltips.caretSize,
					cornerRadius: options.tooltips.cornerRadius,
					backgroundColor: options.tooltips.backgroundColor,
					opacity: 0,
					legendColorBackground: options.tooltips.multiKeyBackground,
				},
			});
		},

		getTitle: function() {
			var beforeTitle = this._options.tooltips.callbacks.beforeTitle.apply(this, arguments),
				title = this._options.tooltips.callbacks.title.apply(this, arguments),
				afterTitle = this._options.tooltips.callbacks.afterTitle.apply(this, arguments);

			var lines = [];

			if (beforeTitle) {
				lines.push(beforeTitle);
			}
			if (title) {
				lines.push(title);
			}
			if (afterTitle) {
				lines.push(afterTitle);
			}
			return lines;
		},

		getBody: function(xLabel, yLabel, index, datasetIndex) {

			var lines = [];

			var beforeBody = this._options.tooltips.callbacks.beforeBody.apply(this, arguments);
			if (beforeBody) {
				lines.push(beforeBody);
			}

			var beforeLabel,
				afterLabel,
				label;

			if (helpers.isArray(xLabel)) {

				var labels = [];

				// Run EACH label pair through the label callback this time.
				for (var i = 0; i < xLabel.length; i++) {

					beforeLabel = this._options.tooltips.callbacks.beforeLabel(xLabel[i], yLabel[i], index, datasetIndex);
					afterLabel = this._options.tooltips.callbacks.afterLabel(xLabel[i], yLabel[i], index, datasetIndex);

					labels.push((beforeLabel ? beforeLabel : '') + this._options.tooltips.callbacks.label(xLabel[i], yLabel[i], index, datasetIndex) + (afterLabel ? afterLabel : ''));

				}

				if (labels.length) {
					lines = lines.concat(labels);
				}

			} else {

				// Run the single label through the callback

				beforeLabel = this._options.tooltips.callbacks.beforeLabel.apply(this, arguments);
				label = this._options.tooltips.callbacks.label.apply(this, arguments);
				afterLabel = this._options.tooltips.callbacks.afterLabel.apply(this, arguments);

				if (beforeLabel || label || afterLabel) {
					lines.push((beforeLabel ? afterLabel : '') + label + (afterLabel ? afterLabel : ''));
				}
			}

			var afterBody = this._options.tooltips.callbacks.afterBody.apply(this, arguments);
			if (afterBody) {
				lines.push(afterBody);
			}

			return lines;
		},

		getFooter: function() {
			var beforeFooter = this._options.tooltips.callbacks.beforeFooter.apply(this, arguments),
				footer = this._options.tooltips.callbacks.footer.apply(this, arguments),
				afterFooter = this._options.tooltips.callbacks.afterFooter.apply(this, arguments);

			var lines = [];

			if (beforeFooter) {
				lines.push(beforeFooter);
			}
			if (footer) {
				lines.push(footer);
			}
			if (afterFooter) {
				lines.push(afterFooter);
			}

			return lines;
		},

		update: function() {

			var ctx = this._chart.ctx;

			var element = this._active[0],
				xLabel,
				yLabel,
				tooltipPosition;

			if (this._options.tooltips.mode == 'single') {

				xLabel = element._xScale.getLabelForIndex(element._index, element._datasetIndex);
				yLabel = element._yScale.getLabelForIndex(element._index, element._datasetIndex);
				tooltipPosition = this._active[0].tooltipPosition();

			} else {

				xLabel = [];
				yLabel = [];
				helpers.each(this._data.datasets, function(dataset, datasetIndex) {
					xLabel.push(element._xScale.getLabelForIndex(element._index, datasetIndex));
					yLabel.push(element._yScale.getLabelForIndex(element._index, datasetIndex));
				});
				tooltipPosition = this._active[0].tooltipPosition();

				// for (var i = 0; i < this._data.datasets.length; i++) {
				// 	this._data.datasets[i].data[index];
				// };

				// // Tooltip Content

				// var dataArray,
				// 	dataIndex;

				// var labels = [],
				// 	colors = [];

				// for (var i = this._data.datasets.length - 1; i >= 0; i--) {
				// 	dataArray = this._data.datasets[i].metaData;
				// 	dataIndex = helpers.indexOf(dataArray, this._active[0]);
				// 	if (dataIndex !== -1) {
				// 		break;
				// 	}
				// }

				// var medianPosition = (function(index) {
				// 	// Get all the points at that particular index
				// 	var elements = [],
				// 		dataCollection,
				// 		xPositions = [],
				// 		yPositions = [],
				// 		xMax,
				// 		yMax,
				// 		xMin,
				// 		yMin;
				// 	helpers.each(this._data.datasets, function(dataset) {
				// 		dataCollection = dataset.metaData;
				// 		if (dataCollection[dataIndex] && dataCollection[dataIndex].hasValue()) {
				// 			elements.push(dataCollection[dataIndex]);
				// 		}
				// 	}, this);

				// 	// Reverse labels if stacked
				// 	helpers.each(this._options.stacked ? elements.reverse() : elements, function(element) {
				// 		xPositions.push(element._view.x);
				// 		yPositions.push(element._view.y);

				// 		//Include any colour information about the element
				// 		labels.push(
				// 			this._options.tooltips.multiTemplate(
				// 				element,
				// 				this._data.datasets[element._datasetIndex].label,
				// 				this._data.datasets[element._datasetIndex].data[element._index]
				// 			)
				// 		);

				// 		colors.push({
				// 			fill: element._view.backgroundColor,
				// 			stroke: element._view.borderColor
				// 		});

				// 	}, this);

				// 	yMin = helpers.min(yPositions);
				// 	yMax = helpers.max(yPositions);

				// 	xMin = helpers.min(xPositions);
				// 	xMax = helpers.max(xPositions);

				// 	return {
				// 		x: (xMin > this._chart.width / 2) ? xMin : xMax,
				// 		y: (yMin + yMax) / 2,
				// 	};
				// }).call(this, dataIndex);

				// // Apply for now
				// helpers.extend(this._model, {
				// 	x: medianPosition.x,
				// 	y: medianPosition.y,
				// 	labels: labels,
				// 	title: (function() {
				// 		return this._data.timeLabels ? this._data.timeLabels[this._active[0]._index] :
				// 			(this._data.labels && this._data.labels.length) ? this._data.labels[this._active[0]._index] :
				// 			'';
				// 	}).call(this),
				// 	legendColors: colors,
				// 	legendBackgroundColor: this._options.tooltips.multiKeyBackground,
				// });


				// // Calculate Appearance Tweaks

				// this._model.height = (labels.length * this._model.bodyFontSize) + ((labels.length - 1) * (this._model.bodyFontSize / 2)) + (this._model.yPadding * 2) + this._model.titleFontSize * 1.5;

				// var titleWidth = ctx.measureText(this._model.title).width,
				// 	//Label has a legend square as well so account for this.
				// 	labelWidth = helpers.longestText(ctx, this.font, labels) + this._model.bodyFontSize + 3,
				// 	longestTextWidth = helpers.max([labelWidth, titleWidth]);

				// this._model.width = longestTextWidth + (this._model.xPadding * 2);


				// var halfHeight = this._model.height / 2;

				// //Check to ensure the height will fit on the canvas
				// if (this._model.y - halfHeight < 0) {
				// 	this._model.y = halfHeight;
				// } else if (this._model.y + halfHeight > this._chart.height) {
				// 	this._model.y = this._chart.height - halfHeight;
				// }

				// //Decide whether to align left or right based on position on canvas
				// if (this._model.x > this._chart.width / 2) {
				// 	this._model.x -= this._model.xOffset + this._model.width;
				// } else {
				// 	this._model.x += this._model.xOffset;
				// }
				// break;
			}

			// Build the Text Lines
			helpers.extend(this._model, {
				title: this.getTitle(xLabel, yLabel, element._index, element._datasetIndex, this._data),
				body: this.getBody(xLabel, yLabel, element._index, element._datasetIndex, this._data),
				footer: this.getFooter(xLabel, yLabel, element._index, element._datasetIndex, this._data),
			});

			helpers.extend(this._model, {
				x: Math.round(tooltipPosition.x),
				y: Math.round(tooltipPosition.y),
				caretPadding: tooltipPosition.padding
			});

			return this;
		},
		draw: function() {

			var ctx = this._chart.ctx;
			var vm = this._view;

			// Get Dimensions

			vm.position = "top";

			var caretPadding = vm.caretPadding || 2;

			// Height
			var tooltipHeight = vm.yPadding * 2;

			tooltipHeight += vm.title.length * vm.titleFontSize; // Line Height
			tooltipHeight += vm.title.length ? vm.yPadding : 0;
			tooltipHeight += vm.body.length * (vm.bodyFontSize); // Line Height
			tooltipHeight += vm.footer.length ? vm.yPadding : 0;
			tooltipHeight += vm.footer.length * (vm.footerFontSize); // Line Height

			// Width
			var tooltipWidth = 0;
			helpers.each(vm.title, function(line, i) {
				ctx.font = helpers.fontString(vm.titleFontSize, vm._titleFontStyle, vm._titleFontFamily);
				tooltipWidth = Math.max(tooltipWidth, ctx.measureText(line).width);
			});
			helpers.each(vm.body, function(line, i) {
				ctx.font = helpers.fontString(vm.bodyFontSize, vm._bodyFontStyle, vm._bodyFontFamily);
				tooltipWidth = Math.max(tooltipWidth, ctx.measureText(line).width);
			});
			helpers.each(vm.footer, function(line, i) {
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

			if (vm.yAlign == 'top') {
				tooltipY = vm.y - vm.caretSize - vm.cornerRadius;
			} else if (vm.yAlign == 'bottom') {
				tooltipY = vm.y - tooltipHeight + vm.caretSize + vm.cornerRadius;
			} else {
				tooltipY = vm.y - (tooltipHeight / 2);
			}

			if (vm.xAlign == 'left') {
				tooltipX = vm.x - tooltipTotalWidth;
			} else if (vm.xAlign == 'right') {
				tooltipX = vm.x + caretPadding + vm.caretSize;
			} else {
				tooltipX = vm.x + (tooltipTotalWidth / 2);
			}

			// Draw Background

			if (this._options.tooltips.enabled) {
				ctx.fillStyle = helpers.color(vm.backgroundColor).alpha(vm.opacity).rgbString();
				helpers.drawRoundedRectangle(ctx, tooltipX, tooltipY, tooltipWidth, tooltipHeight, vm.cornerRadius);
				ctx.fill();
			}


			// Draw Caret
			if (this._options.tooltips.enabled) {
				ctx.fillStyle = helpers.color(vm.backgroundColor).alpha(vm.opacity).rgbString();

				if (vm.xAlign == 'left') {

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

				var bodyStart,
					footerStart;

				// Titles
				ctx.textAlign = vm._titleAlign;
				ctx.textBaseline = "top";
				ctx.fillStyle = helpers.color(vm.titleColor).alpha(vm.opacity).rgbString();
				ctx.font = helpers.fontString(vm.titleFontSize, vm._titleFontStyle, vm._titleFontFamily);

				helpers.each(vm.title, function(title, i) {
					var yPos = tooltipY + vm.yPadding + (vm.titleFontSize * i);
					ctx.fillText(title, tooltipX + vm.xPadding, yPos);
					if (i + 1 == vm.title.length) {
						bodyStart = yPos + vm.yPadding + vm.titleFontSize;
					}
				}, this);


				// Body
				ctx.textAlign = vm._bodyAlign;
				ctx.textBaseline = "top";
				ctx.fillStyle = helpers.color(vm.bodyColor).alpha(vm.opacity).rgbString();
				ctx.font = helpers.fontString(vm.bodyFontSize, vm._bodyFontStyle, vm._bodyFontFamily);

				console.log(bodyStart);

				helpers.each(vm.body, function(body, i) {
					var yPos = bodyStart + (vm.bodyFontSize * i);
					ctx.fillText(body, tooltipX + vm.xPadding, yPos);
					if (i + 1 == vm.body.length) {
						footerStart = yPos + vm.bodyFontSize;
					}
				}, this);

				// Footer
				ctx.textAlign = vm._footerAlign;
				ctx.textBaseline = "top";
				ctx.fillStyle = helpers.color(vm.footerColor).alpha(vm.opacity).rgbString();
				ctx.font = helpers.fontString(vm.footerFontSize, vm._footerFontStyle, vm._footerFontFamily);

				helpers.each(vm.footer, function(footer, i) {
					var yPos = footerStart + vm.yPadding + (vm.footerFontSize * i);
					ctx.fillText(footer, tooltipX + vm.xPadding, yPos);
				}, this);

			}

			return;

			// Draw Body
			ctx.font = helpers.fontString(vm.bodyFontSize, vm._bodyFontStyle, vm._bodyFontFamily);

			// Draw Footer

			// Custom Tooltips

			if (this._options.tooltips.custom) {
				this._options.tooltips.custom(this);
			}

			switch (this._options.tooltips.mode) {
				case 'single':



					ctx.fillStyle = helpers.color(vm.textColor).alpha(vm.opacity).rgbString();
					ctx.textAlign = "center";
					ctx.textBaseline = "middle";
					ctx.fillText(vm.text, tooltipX + tooltipWidth / 2, tooltipY + tooltipHeight / 2);
					break;
				case 'label':


					//helpers.drawRoundedRectangle(ctx, vm.x, vm.y - vm.height / 2, vm.width, vm.height, vm.cornerRadius);
					// ctx.fillStyle = helpers.color(vm.backgroundColor).alpha(vm.opacity).rgbString();
					// ctx.fill();
					// ctx.closePath();

					// Title
					ctx.textAlign = "left";
					ctx.textBaseline = "middle";
					ctx.fillStyle = helpers.color(vm.titleColor).alpha(vm.opacity).rgbString();
					ctx.font = helpers.fontString(vm.bodyFontSize, vm._titleFontStyle, vm._titleFontFamily);
					ctx.fillText(vm.title, vm.x + vm.xPadding, this.getLineHeight(0));

					ctx.font = helpers.fontString(vm.bodyFontSize, vm._bodyFontStyle, vm._bodyFontFamily);
					helpers.each(vm.labels, function(label, index) {
						ctx.fillStyle = helpers.color(vm.textColor).alpha(vm.opacity).rgbString();
						ctx.fillText(label, vm.x + vm.xPadding + vm.bodyFontSize + 3, this.getLineHeight(index + 1));

						//A bit gnarly, but clearing this rectangle breaks when using explorercanvas (clears whole canvas)
						//ctx.clearRect(vm.x + vm.xPadding, this.getLineHeight(index + 1) - vm.bodyFontSize/2, vm.bodyFontSize, vm.bodyFontSize);
						//Instead we'll make a white filled block to put the legendColour palette over.

						ctx.fillStyle = helpers.color(vm.legendColors[index].stroke).alpha(vm.opacity).rgbString();
						ctx.fillRect(vm.x + vm.xPadding - 1, this.getLineHeight(index + 1) - vm.bodyFontSize / 2 - 1, vm.bodyFontSize + 2, vm.bodyFontSize + 2);

						ctx.fillStyle = helpers.color(vm.legendColors[index].fill).alpha(vm.opacity).rgbString();
						ctx.fillRect(vm.x + vm.xPadding, this.getLineHeight(index + 1) - vm.bodyFontSize / 2, vm.bodyFontSize, vm.bodyFontSize);


					}, this);
					break;
			}
		},
	});

}).call(this);

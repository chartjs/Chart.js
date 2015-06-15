(function() {

	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;

	Chart.defaults.global.tooltips = {
		enabled: true,
		custom: null,
		backgroundColor: "rgba(0,0,0,0.8)",
		fontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
		fontSize: 10,
		fontStyle: "normal",
		fontColor: "#fff",
		titleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
		titleFontSize: 12,
		titleFontStyle: "bold",
		titleFontColor: "#fff",
		yPadding: 6,
		xPadding: 6,
		caretSize: 8,
		cornerRadius: 6,
		xOffset: 10,
		template: [
			'<% if(label){ %>',
			'<%=label %>: ',
			'<% } %>',
			'<%=value %>',
		].join(''),
		multiTemplate: [
			'<%if (datasetLabel){ %>',
			'<%=datasetLabel %>: ',
			'<% } %>',
			'<%=value %>'
		].join(''),
		multiKeyBackground: '#fff',
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

					// Labels
					textColor: options.tooltips.fontColor,
					_fontFamily: options.tooltips.fontFamily,
					_fontStyle: options.tooltips.fontStyle,
					fontSize: options.tooltips.fontSize,

					// Title
					titleTextColor: options.tooltips.titleFontColor,
					_titleFontFamily: options.tooltips.titleFontFamily,
					_titleFontStyle: options.tooltips.titleFontStyle,
					titleFontSize: options.tooltips.titleFontSize,

					// Appearance
					caretHeight: options.tooltips.caretSize,
					cornerRadius: options.tooltips.cornerRadius,
					backgroundColor: options.tooltips.backgroundColor,
					opacity: 0,
					legendColorBackground: options.tooltips.multiKeyBackground,
				},
			});
		},
		update: function() {

			var ctx = this._chart.ctx;

			switch (this._options.hover.mode) {
				case 'single':
					helpers.extend(this._model, {
						text: helpers.template(this._options.tooltips.template, {
							// These variables are available in the template function. Add others here
							element: this._active[0],
							value: this._data.datasets[this._active[0]._datasetIndex].data[this._active[0]._index],
							label: this._data.labels ? this._data.labels[this._active[0]._index] : '',
						}),
					});

					var tooltipPosition = this._active[0].tooltipPosition();
					helpers.extend(this._model, {
						x: Math.round(tooltipPosition.x),
						y: Math.round(tooltipPosition.y),
						caretPadding: tooltipPosition.padding
					});

					break;

				case 'label':

					// Tooltip Content

					var dataArray,
						dataIndex;

					var labels = [],
						colors = [];

					for (var i = this._data.datasets.length - 1; i >= 0; i--) {
						dataArray = this._data.datasets[i].metaData;
						dataIndex = helpers.indexOf(dataArray, this._active[0]);
						if (dataIndex !== -1) {
							break;
						}
					}

					var medianPosition = (function(index) {
						// Get all the points at that particular index
						var elements = [],
							dataCollection,
							xPositions = [],
							yPositions = [],
							xMax,
							yMax,
							xMin,
							yMin;
						helpers.each(this._data.datasets, function(dataset) {
							dataCollection = dataset.metaData;
							if (dataCollection[dataIndex] && dataCollection[dataIndex].hasValue()) {
								elements.push(dataCollection[dataIndex]);
							}
						}, this);

						// Reverse labels if stacked
						helpers.each(this._options.stacked ? elements.reverse() : elements, function(element) {
							xPositions.push(element._view.x);
							yPositions.push(element._view.y);

							//Include any colour information about the element
							labels.push(helpers.template(this._options.tooltips.multiTemplate, {
								// These variables are available in the template function. Add others here
								element: element,
								datasetLabel: this._data.datasets[element._datasetIndex].label,
								value: this._data.datasets[element._datasetIndex].data[element._index],
							}));
							colors.push({
								fill: element._view.backgroundColor,
								stroke: element._view.borderColor
							});

						}, this);

						yMin = helpers.min(yPositions);
						yMax = helpers.max(yPositions);

						xMin = helpers.min(xPositions);
						xMax = helpers.max(xPositions);

						return {
							x: (xMin > this._chart.width / 2) ? xMin : xMax,
							y: (yMin + yMax) / 2,
						};
					}).call(this, dataIndex);

					// Apply for now
					helpers.extend(this._model, {
						x: medianPosition.x,
						y: medianPosition.y,
						labels: labels,
						title: this._data.labels && this._data.labels.length ? this._data.labels[this._active[0]._index] : '',
						legendColors: colors,
						legendBackgroundColor: this._options.tooltips.multiKeyBackground,
					});


					// Calculate Appearance Tweaks

					this._model.height = (labels.length * this._model.fontSize) + ((labels.length - 1) * (this._model.fontSize / 2)) + (this._model.yPadding * 2) + this._model.titleFontSize * 1.5;

					var titleWidth = ctx.measureText(this.title).width,
						//Label has a legend square as well so account for this.
						labelWidth = helpers.longestText(ctx, this.font, labels) + this._model.fontSize + 3,
						longestTextWidth = helpers.max([labelWidth, titleWidth]);

					this._model.width = longestTextWidth + (this._model.xPadding * 2);


					var halfHeight = this._model.height / 2;

					//Check to ensure the height will fit on the canvas
					if (this._model.y - halfHeight < 0) {
						this._model.y = halfHeight;
					} else if (this._model.y + halfHeight > this._chart.height) {
						this._model.y = this._chart.height - halfHeight;
					}

					//Decide whether to align left or right based on position on canvas
					if (this._model.x > this._chart.width / 2) {
						this._model.x -= this._model.xOffset + this._model.width;
					} else {
						this._model.x += this._model.xOffset;
					}
					break;
			}

			return this;
		},
		draw: function() {

			var ctx = this._chart.ctx;
			var vm = this._view;

			switch (this._options.hover.mode) {
				case 'single':

					ctx.font = helpers.fontString(vm.fontSize, vm._fontStyle, vm._fontFamily);

					vm.xAlign = "center";
					vm.yAlign = "above";

					//Distance between the actual element.y position and the start of the tooltip caret
					var caretPadding = vm.caretPadding || 2;

					var tooltipWidth = ctx.measureText(vm.text).width + 2 * vm.xPadding,
						tooltipRectHeight = vm.fontSize + 2 * vm.yPadding,
						tooltipHeight = tooltipRectHeight + vm.caretHeight + caretPadding;

					if (vm.x + tooltipWidth / 2 > this._chart.width) {
						vm.xAlign = "left";
					} else if (vm.x - tooltipWidth / 2 < 0) {
						vm.xAlign = "right";
					}

					if (vm.y - tooltipHeight < 0) {
						vm.yAlign = "below";
					}

					var tooltipX = vm.x - tooltipWidth / 2,
						tooltipY = vm.y - tooltipHeight;

					ctx.fillStyle = helpers.color(vm.backgroundColor).alpha(vm.opacity).rgbString();

					// Custom Tooltips
					if (this._custom) {
						this._custom(this._view);
					} else {
						switch (vm.yAlign) {
							case "above":
								//Draw a caret above the x/y
								ctx.beginPath();
								ctx.moveTo(vm.x, vm.y - caretPadding);
								ctx.lineTo(vm.x + vm.caretHeight, vm.y - (caretPadding + vm.caretHeight));
								ctx.lineTo(vm.x - vm.caretHeight, vm.y - (caretPadding + vm.caretHeight));
								ctx.closePath();
								ctx.fill();
								break;
							case "below":
								tooltipY = vm.y + caretPadding + vm.caretHeight;
								//Draw a caret below the x/y
								ctx.beginPath();
								ctx.moveTo(vm.x, vm.y + caretPadding);
								ctx.lineTo(vm.x + vm.caretHeight, vm.y + caretPadding + vm.caretHeight);
								ctx.lineTo(vm.x - vm.caretHeight, vm.y + caretPadding + vm.caretHeight);
								ctx.closePath();
								ctx.fill();
								break;
						}

						switch (vm.xAlign) {
							case "left":
								tooltipX = vm.x - tooltipWidth + (vm.cornerRadius + vm.caretHeight);
								break;
							case "right":
								tooltipX = vm.x - (vm.cornerRadius + vm.caretHeight);
								break;
						}

						helpers.drawRoundedRectangle(ctx, tooltipX, tooltipY, tooltipWidth, tooltipRectHeight, vm.cornerRadius);

						ctx.fill();

						ctx.fillStyle = helpers.color(vm.textColor).alpha(vm.opacity).rgbString();
						ctx.textAlign = "center";
						ctx.textBaseline = "middle";
						ctx.fillText(vm.text, tooltipX + tooltipWidth / 2, tooltipY + tooltipRectHeight / 2);

					}
					break;
				case 'label':

					helpers.drawRoundedRectangle(ctx, vm.x, vm.y - vm.height / 2, vm.width, vm.height, vm.cornerRadius);
					ctx.fillStyle = helpers.color(vm.backgroundColor).alpha(vm.opacity).rgbString();
					ctx.fill();
					ctx.closePath();

					ctx.textAlign = "left";
					ctx.textBaseline = "middle";
					ctx.fillStyle = helpers.color(vm.titleTextColor).alpha(vm.opacity).rgbString();
					ctx.font = helpers.fontString(vm.fontSize, vm._titleFontStyle, vm._titleFontFamily);
					ctx.fillText(vm.title, vm.x + vm.xPadding, this.getLineHeight(0));

					ctx.font = helpers.fontString(vm.fontSize, vm._fontStyle, vm._fontFamily);
					helpers.each(vm.labels, function(label, index) {
						ctx.fillStyle = helpers.color(vm.textColor).alpha(vm.opacity).rgbString();
						ctx.fillText(label, vm.x + vm.xPadding + vm.fontSize + 3, this.getLineHeight(index + 1));

						//A bit gnarly, but clearing this rectangle breaks when using explorercanvas (clears whole canvas)
						//ctx.clearRect(vm.x + vm.xPadding, this.getLineHeight(index + 1) - vm.fontSize/2, vm.fontSize, vm.fontSize);
						//Instead we'll make a white filled block to put the legendColour palette over.

						ctx.fillStyle = helpers.color(vm.legendColors[index].stroke).alpha(vm.opacity).rgbString();
						ctx.fillRect(vm.x + vm.xPadding - 1, this.getLineHeight(index + 1) - vm.fontSize / 2 - 1, vm.fontSize + 2, vm.fontSize + 2);

						ctx.fillStyle = helpers.color(vm.legendColors[index].fill).alpha(vm.opacity).rgbString();
						ctx.fillRect(vm.x + vm.xPadding, this.getLineHeight(index + 1) - vm.fontSize / 2, vm.fontSize, vm.fontSize);


					}, this);
					break;
			}
		},
		getLineHeight: function(index) {
			var baseLineHeight = this._view.y - (this._view.height / 2) + this._view.yPadding,
				afterTitleIndex = index - 1;

			//If the index is zero, we're getting the title
			if (index === 0) {
				return baseLineHeight + this._view.titleFontSize / 2;
			} else {
				return baseLineHeight + ((this._view.fontSize * 1.5 * afterTitleIndex) + this._view.fontSize / 2) + this._view.titleFontSize * 1.5;
			}

		},
	});

}).call(this);

(function(){
	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;

	var defaultConfig = {

		///Boolean - Whether grid lines are shown across the chart
		scaleShowGridLines : true,

		//String - Colour of the grid lines
		scaleGridLineColor : "rgba(0,0,0,.05)",

		//Number - Width of the grid lines
		scaleGridLineWidth : 1,

		//Boolean - Whether to show horizontal lines (except X axis)
		scaleShowHorizontalLines: true,

		//Boolean - Whether to show vertical lines (except Y axis)
		scaleShowVerticalLines: true,

		//Number - Tension of the bezier curve between points
		tension : 0.4,

		//Number - Radius of each point dot in pixels
		pointRadius : 4,

		//Number - Pixel width of point dot border
		pointBorderWidth : 1,

		//Number - amount extra to add to the radius to cater for hit detection outside the drawn point
		pointHoverRadius : 20,

		//Number - Pixel width of dataset border
		borderWidth : 2,

		//String - A legend template
		legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].borderColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>",

		//Boolean - Whether to horizontally center the label and point dot inside the grid
		offsetGridLines : false

	};


	Chart.Type.extend({
		name: "Line",
		defaults : defaultConfig,
		initialize:  function(data){
			// Save data as a source for updating of values & methods
			this.data = data;

			//Custom Point Defaults
			this.PointClass = Chart.Point.extend({
				_chart: this.chart,
				offsetGridLines : this.options.offsetGridLines,
				borderWidth : this.options.pointBorderWidth,
				radius : this.options.pointRadius,
				hoverRadius : this.options.pointHoverRadius,
			});

			// Events
			helpers.bindEvents(this, this.options.tooltipEvents, this.onHover);

			// Build Scale
			this.buildScale(this.data.labels);


			//Create a new line and its points for each dataset and piece of data
			helpers.each(this.data.datasets,function(dataset,datasetIndex){
				dataset.metaDataset = new Chart.Line();
				dataset.metaData = [];
				helpers.each(dataset.data,function(dataPoint,index){
					dataset.metaData.push(new this.PointClass());
				},this);
			},this);

			// Set defaults for lines
			this.eachDataset(function(dataset, datasetIndex){
				dataset = helpers.merge(this.options, dataset);
				helpers.extend(dataset.metaDataset, {
					_points: dataset.metaData,
					_datasetIndex: datasetIndex,
					_chart: this.chart,
				});
				// Copy to view model
				dataset.metaDataset.save();
			}, this);

			// Set defaults for points
			this.eachElement(function(point, index, dataset, datasetIndex){
				helpers.extend(point, {
					x: this.scale.calculateX(index),
					y: this.scale.endPoint,
					_datasetIndex: datasetIndex,
					_index: index,
					_chart: this.chart
				});

				// Default bezier control points
				helpers.extend(point, {
					controlPointPreviousX: this.previousPoint(dataset, index).x,
					controlPointPreviousY: this.nextPoint(dataset, index).y,
					controlPointNextX: this.previousPoint(dataset, index).x,
					controlPointNextY: this.nextPoint(dataset, index).y,
				});
				// Copy to view model
				point.save();
			}, this);

			// Create tooltip instance exclusively for this chart with some defaults.
			this.tooltip = new Chart.Tooltip({
				_chart: this.chart,
				_data: this.data,
				_options: this.options,
			}, this);

			this.update();
		},
		nextPoint: function(collection, index){
			return collection[index - 1] || collection[index];
		},
		previousPoint: function(collection, index){
			return collection[index + 1] || collection[index];
		},
		onHover: function(e){


			// If exiting chart
			if(e.type == 'mouseout'){
				return this;
			}

			this.lastActive = this.lastActive || [];

			// Find Active Elements
			this.active = function(){
				switch(this.options.hoverMode){
					case 'single':
						return this.getElementAtEvent(e);
					case 'label':
						return this.getElementsAtEvent(e);
					case 'dataset':
						return this.getDatasetAtEvent(e);
					default:
						return e;
				}
			}.call(this);

			// On Hover hook
			if(this.options.onHover){
				this.options.onHover.call(this, this.active);
			}

			// Remove styling for last active (even if it may still be active)
			if(this.lastActive.length){
				switch(this.options.hoverMode){
					case 'single':
						this.lastActive[0].backgroundColor = this.data.datasets[this.lastActive[0]._datasetIndex].pointBackgroundColor;
						this.lastActive[0].borderColor = this.data.datasets[this.lastActive[0]._datasetIndex].pointBorderColor;
						this.lastActive[0].borderWidth = this.data.datasets[this.lastActive[0]._datasetIndex].pointBorderWidth;
						break;
					case 'label':
						for (var i = 0; i < this.lastActive.length; i++) {
							this.lastActive[i].backgroundColor = this.data.datasets[this.lastActive[i]._datasetIndex].pointBackgroundColor;
							this.lastActive[i].borderColor = this.data.datasets[this.lastActive[i]._datasetIndex].pointBorderColor;
							this.lastActive[i].borderWidth = this.data.datasets[this.lastActive[0]._datasetIndex].pointBorderWidth;
						}
						break;
					case 'dataset':
						break;
					default:
						// Don't change anything
				}
			}
			
			// Built in hover styling
			if(this.active.length && this.options.hoverMode){
				switch(this.options.hoverMode){
					case 'single':
						this.active[0].backgroundColor = this.data.datasets[this.active[0]._datasetIndex].hoverBackgroundColor || helpers.color(this.active[0].backgroundColor).saturate(0.5).darken(0.35).rgbString();
						this.active[0].borderColor = this.data.datasets[this.active[0]._datasetIndex].hoverBorderColor || helpers.color(this.active[0].borderColor).saturate(0.5).darken(0.35).rgbString();
						this.active[0].borderWidth = this.data.datasets[this.active[0]._datasetIndex].borderWidth + 10;
						break;
					case 'label':
						for (var i = 0; i < this.active.length; i++) {
							this.active[i].backgroundColor = this.data.datasets[this.active[i]._datasetIndex].hoverBackgroundColor || helpers.color(this.active[i].backgroundColor).saturate(0.5).darken(0.35).rgbString();
							this.active[i].borderColor = this.data.datasets[this.active[i]._datasetIndex].hoverBorderColor || helpers.color(this.active[i].borderColor).saturate(0.5).darken(0.35).rgbString();
							this.active[i].borderWidth = this.data.datasets[this.active[i]._datasetIndex].borderWidth + 2;
						}
						break;
					case 'dataset':
						break;
					default:
						// Don't change anything
				}
			}


			// Built in Tooltips
			if(this.options.showTooltips){

				// The usual updates
				this.tooltip.initialize();

				// Active
				if(this.active.length){
					helpers.extend(this.tooltip, {
						opacity: 1,
						_active: this.active,
					});

					this.tooltip.update();
				}
				else{
					// Inactive
					helpers.extend(this.tooltip, {
						opacity: 0,
					});
				}
			}


			// Hover animations
			if(!this.animating){
				var changed;
				
				helpers.each(this.active, function(element, index){
					if (element !== this.lastActive[index]){
						changed = true;
					}
				}, this);

				// If entering, leaving, or changing elements, animate the change via pivot
				if ((!this.lastActive.length && this.active.length) ||
					(this.lastActive.length && !this.active.length)||
					(this.lastActive.length && this.active.length && changed)){

					this.tooltip.pivot();
					this.stop();
					this.render(this.options.hoverAnimationDuration);
				}
			}	

			// Remember Last Active
			this.lastActive = this.active;
			return this;
		},
		update : function(){

			this.scale.update();

			// Update the lines
			this.eachDataset(function(dataset, datasetIndex){
				helpers.extend(dataset.metaDataset, {
					backgroundColor: dataset.backgroundColor || this.options.backgroundColor,
					borderWidth: dataset.borderWidth || this.options.borderWidth,
					borderColor: dataset.borderColor || this.options.borderColor,
					tension: dataset.tension || this.options.tension,
					scaleTop: this.scale.startPoint,
					scaleBottom: this.scale.endPoint,
					_points: dataset.metaData,
					_datasetIndex: datasetIndex,
				});
				dataset.metaDataset.pivot();
			});

			// Update the points
			this.eachElement(function(point, index, dataset, datasetIndex){
				helpers.extend(point, {
					x: this.scale.calculateX(index),
					y: this.scale.calculateY(this.data.datasets[datasetIndex].data[index]),
					value : this.data.datasets[datasetIndex].data[index],
					label : this.data.labels[index],
					datasetLabel: this.data.datasets[datasetIndex].label,
					// Appearance
					hoverBackgroundColor: this.data.datasets[datasetIndex].pointHoverBackgroundColor || this.options.pointHoverBackgroundColor,
					hoverBorderColor : this.data.datasets[datasetIndex].pointHoverBorderColor || this.options.pointHoverBorderColor,
					hoverRadius : this.data.datasets[datasetIndex].pointHoverRadius || this.options.pointHoverRadius,
					radius: this.data.datasets[datasetIndex].pointRadius || this.options.pointRadius,
					borderWidth: this.data.datasets[datasetIndex].pointBorderWidth || this.options.pointBorderWidth,
					borderColor: this.data.datasets[datasetIndex].pointBorderColor || this.options.pointBorderColor,
					backgroundColor: this.data.datasets[datasetIndex].pointBackgroundColor || this.options.pointBackgroundColor,
					tension: this.data.datasets[datasetIndex].metaDataset.tension,
					_datasetIndex: datasetIndex,
					_index: index,
				});
			}, this);

			// Update control points for the bezier curve
			this.eachElement(function(point, index, dataset, datasetIndex){
				var controlPoints = helpers.splineCurve(
					this.previousPoint(dataset, index),
					point,
					this.nextPoint(dataset, index),
					point.tension
				);

				point.controlPointPreviousX = controlPoints.previous.x;
				point.controlPointNextX = controlPoints.next.x;

				// Prevent the bezier going outside of the bounds of the graph

				// Cap puter bezier handles to the upper/lower scale bounds
				if (controlPoints.next.y > this.scale.endPoint){
					point.controlPointNextY = this.scale.endPoint;
				}
				else if (controlPoints.next.y < this.scale.startPoint){
					point.controlPointNextY = this.scale.startPoint;
				}
				else{
					point.controlPointNextY = controlPoints.next.y;
				}

				// Cap inner bezier handles to the upper/lower scale bounds
				if (controlPoints.previous.y > this.scale.endPoint){
					point.controlPointPreviousY = this.scale.endPoint;
				}
				else if (controlPoints.previous.y < this.scale.startPoint){
					point.controlPointPreviousY = this.scale.startPoint;
				}
				else{
					point.controlPointPreviousY = controlPoints.previous.y;
				}
				// Now pivot the point for animation
				point.pivot();
			}, this);

			this.render();
		},
		buildScale : function(labels){
			var self = this;

			var dataTotal = function(){
				var values = [];
				self.eachValue(function(value){
					values.push(value);
				});

				return values;
			};

			var scaleOptions = {
				templateString : this.options.scaleLabel,
				height : this.chart.height,
				width : this.chart.width,
				ctx : this.chart.ctx,
				textColor : this.options.scaleFontColor,
				offsetGridLines : this.options.offsetGridLines,
				fontSize : this.options.scaleFontSize,
				fontStyle : this.options.scaleFontStyle,
				fontFamily : this.options.scaleFontFamily,
				valuesCount : labels.length,
				beginAtZero : this.options.scaleBeginAtZero,
				integersOnly : this.options.scaleIntegersOnly,
				calculateYRange : function(currentHeight){
					var updatedRanges = helpers.calculateScaleRange(
						dataTotal(),
						currentHeight,
						this.fontSize,
						this.beginAtZero,
						this.integersOnly
					);
					helpers.extend(this, updatedRanges);
				},
				xLabels : this.data.labels,
				font : helpers.fontString(this.options.scaleFontSize, this.options.scaleFontStyle, this.options.scaleFontFamily),
				lineWidth : this.options.scaleLineWidth,
				lineColor : this.options.scaleLineColor,
				showHorizontalLines : this.options.scaleShowHorizontalLines,
				showVerticalLines : this.options.scaleShowVerticalLines,
				gridLineWidth : (this.options.scaleShowGridLines) ? this.options.scaleGridLineWidth : 0,
				gridLineColor : (this.options.scaleShowGridLines) ? this.options.scaleGridLineColor : "rgba(0,0,0,0)",
				padding: (this.options.showScale) ? 0 : this.options.pointRadius + this.options.pointBorderWidth,
				showLabels : this.options.scaleShowLabels,
				display : this.options.showScale
			};

			if (this.options.scaleOverride){
				helpers.extend(scaleOptions, {
					calculateYRange: helpers.noop,
					steps: this.options.scaleSteps,
					stepValue: this.options.scaleStepWidth,
					min: this.options.scaleStartValue,
					max: this.options.scaleStartValue + (this.options.scaleSteps * this.options.scaleStepWidth)
				});
			}

			this.scale = new Chart.Scale(scaleOptions);
		},
		redraw : function(){
			
		},
		draw : function(ease){

			var easingDecimal = ease || 1;
			this.clear();

			this.scale.draw(easingDecimal);

			this.eachDataset(function(dataset, datasetIndex){

				// Transition Point Locations
				helpers.each(dataset.metaData, function(point, index){
					point.transition(easingDecimal);
				},this);

				// Transition and Draw the line
				dataset.metaDataset.transition(easingDecimal).draw();

				// Draw the points
				helpers.each(dataset.metaData,function(point){
					point.draw();
				});
			},this);

			// Finally draw the tooltip
			this.tooltip.transition(easingDecimal).draw();
		}
	});


}).call(this);

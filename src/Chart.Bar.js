(function(){
	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;


	var defaultConfig = {
		//Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
		scaleBeginAtZero : true,

		//Boolean - Whether grid lines are shown across the chart
		scaleShowGridLines : true,

		//String - Colour of the grid lines
		scaleGridLineColor : "rgba(0,0,0,.05)",

		//Number - Width of the grid lines
		scaleGridLineWidth : 1,

		//Boolean - Whether to show horizontal lines (except X axis)
		scaleShowHorizontalLines: true,

		//Boolean - Whether to show vertical lines (except Y axis)
		scaleShowVerticalLines: true,

		//Number - Pixel width of the bar border
		barBorderWidth : 2,

		//Number - Spacing between each of the X value sets
		barValueSpacing : 5,

		//Number - Spacing between data sets within X values
		barDatasetSpacing : 1,

		//String - A legend template
		legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].backgroundColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"

	};


	Chart.Type.extend({
		name: "Bar",
		defaults : defaultConfig,
		initialize:  function(data){

			// Save data as a source for updating of values & methods
			this.data = data;

			var options = this.options;

			// Custom Scale Methods and Options
			this.ScaleClass = Chart.Scale.extend({
				offsetGridLines : true,
				calculateBarX : function(datasetCount, datasetIndex, elementIndex){
					//Reusable method for calculating the xPosition of a given bar based on datasetIndex & width of the bar
					var xWidth = this.calculateBaseWidth(),
						xAbsolute = this.calculateX(elementIndex) - (xWidth/2),
						barWidth = this.calculateBarWidth(datasetCount);

					return xAbsolute + (barWidth * datasetIndex) + (datasetIndex * options.barDatasetSpacing) + barWidth/2;
				},
				calculateBaseWidth : function(){
					return (this.calculateX(1) - this.calculateX(0)) - (2*options.barValueSpacing);
				},
				calculateBarWidth : function(datasetCount){
					//The padding between datasets is to the right of each bar, providing that there are more than 1 dataset
					var baseWidth = this.calculateBaseWidth() - ((datasetCount - 1) * options.barDatasetSpacing);

					return (baseWidth / datasetCount);
				}
			});

			// Events
			helpers.bindEvents(this, this.options.tooltipEvents, this.onHover);
			
			//Declare the extension of the default point, to cater for the options passed in to the constructor
			this.BarClass = Chart.Rectangle.extend({
				ctx : this.chart.ctx,
			});

			// Build Scale
			this.buildScale(this.data.labels);

			//Create a new bar for each piece of data
			helpers.each(this.data.datasets,function(dataset,datasetIndex){
				dataset.metaData = [];
				helpers.each(dataset.data,function(dataPoint,index){
					dataset.metaData.push(new this.BarClass());
				},this);
			},this);

			// Set defaults for bars
			this.eachElement(function(bar, index, datasetIndex){
				helpers.extend(bar, {
					width : this.scale.calculateBarWidth(this.data.datasets.length),
					x: this.scale.calculateBarX(this.data.datasets.length, datasetIndex, index),
					y: this.calculateBaseY(),
					_datasetIndex: datasetIndex,
					_index: index,
				});
				// Copy to view model
				bar.save();
			}, this);

			// Create tooltip instance exclusively for this chart with some defaults.
			this.tooltip = new Chart.Tooltip({
				_chart: this.chart,
				_data: this.data,
				_options: this.options,
			}, this);

			// Update the chart with the latest data.
			this.update();
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
						this.lastActive[0].backgroundColor = this.data.datasets[this.lastActive[0]._datasetIndex].backgroundColor;
						this.lastActive[0].borderColor = this.data.datasets[this.lastActive[0]._datasetIndex].borderColor;
						break;
					case 'label':
						for (var i = 0; i < this.lastActive.length; i++) {
							this.lastActive[i].backgroundColor = this.data.datasets[this.lastActive[i]._datasetIndex].backgroundColor;
							this.lastActive[i].borderColor = this.data.datasets[this.lastActive[i]._datasetIndex].borderColor;
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
						break;
					case 'label':
						for (var i = 0; i < this.active.length; i++) {
							this.active[i].backgroundColor = this.data.datasets[this.active[i]._datasetIndex].hoverBackgroundColor || helpers.color(this.active[i].backgroundColor).saturate(0.5).darken(0.35).rgbString();
							this.active[i].borderColor = this.data.datasets[this.active[i]._datasetIndex].hoverBorderColor || helpers.color(this.active[i].borderColor).saturate(0.5).darken(0.35).rgbString();
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
		// Calculate the base point for the bar.
		calculateBaseY: function() {
			var base = this.scale.endPoint;
			
			if (this.scale.beginAtZero || ((this.scale.min <= 0 && this.scale.max >= 0) || (this.scale.min >= 0 && this.scale.max <= 0)))
			{
				base = this.scale.calculateY(0);
				base += this.options.scaleGridLineWidth;
			}
			else if (this.scale.min < 0 && this.scale.max < 0)
			{
				// All values are negative. Use the top as the base
				base = this.scale.startPoint;
			}
			
			return base;
		},
		update : function(){

			this.scale.update();

			this.eachElement(function(bar, index, datasetIndex){
				helpers.extend(bar, {
					width : this.scale.calculateBarWidth(this.data.datasets.length),
					x: this.scale.calculateBarX(this.data.datasets.length, datasetIndex, index),
					y: this.scale.calculateY(this.data.datasets[datasetIndex].data[index]),
					value : this.data.datasets[datasetIndex].data[index],
					label : this.data.labels[index],
					datasetLabel: this.data.datasets[datasetIndex].label,
					borderColor : this.data.datasets[datasetIndex].borderColor,
					borderWidth : this.data.datasets[datasetIndex].borderWidth,
					backgroundColor : this.data.datasets[datasetIndex].backgroundColor,
					_datasetIndex: datasetIndex,
					_index: index,
				});
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
				fontSize : this.options.scaleFontSize,
				fontStyle : this.options.scaleFontStyle,
				fontFamily : this.options.scaleFontFamily,
				valuesCount : labels.length,
				beginAtZero : this.options.scaleBeginAtZero,
				integersOnly : this.options.scaleIntegersOnly,
				calculateYRange: function(currentHeight){
					var updatedRanges = helpers.calculateScaleRange(
						dataTotal(),
						currentHeight,
						this.fontSize,
						this.beginAtZero,
						this.integersOnly
					);
					helpers.extend(this, updatedRanges);
				},
				xLabels : labels,
				font : helpers.fontString(this.options.scaleFontSize, this.options.scaleFontStyle, this.options.scaleFontFamily),
				lineWidth : this.options.scaleLineWidth,
				lineColor : this.options.scaleLineColor,
				showHorizontalLines : this.options.scaleShowHorizontalLines,
				showVerticalLines : this.options.scaleShowVerticalLines,
				gridLineWidth : (this.options.scaleShowGridLines) ? this.options.scaleGridLineWidth : 0,
				gridLineColor : (this.options.scaleShowGridLines) ? this.options.scaleGridLineColor : "rgba(0,0,0,0)",
				padding : (this.options.showScale) ? 0 : this.options.borderWidth,
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

			this.scale = new this.ScaleClass(scaleOptions);
		},
		// This should be incorportated into the init as something like a default value. "Reflow" seems like a weird word for a fredraw function
		redraw : function(){
			var base = this.calculateBaseY();
			this.eachElement(function(element, index, datasetIndex){
				helpers.extend(element,{
					y: base,
					base : base
				});
			});
			this.render();
		},
		draw : function(ease){

			var easingDecimal = ease || 1;
			this.clear();

			this.scale.draw(easingDecimal);

			//Draw all the bars for each dataset
			this.eachElement(function(bar, index, datasetIndex){
				if (bar.hasValue()){
					// Update the bar basepoint
					bar.base = this.calculateBaseY();
					//Transition 
					bar.transition(easingDecimal).draw();
				}
			}, this);

			// Finally draw the tooltip
			this.tooltip.transition(easingDecimal).draw();
		}
	});


}).call(this);

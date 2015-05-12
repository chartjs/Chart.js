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

		//String / Boolean - Hover mode for events.
		hoverMode : 'single', // 'label', 'dataset', 'false'

		//Function - Custom hover handler
		onHover : null,

		//Function - Custom hover handler
		hoverAnimationDuration : 400,

		//String - A legend template
		legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].backgroundColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"

	};


	Chart.Type.extend({
		name: "Bar",
		defaults : defaultConfig,
		initialize:  function(data){

			// Save data as a source for updating of values & methods
			this.data = data;

			//Expose options as a scope variable here so we can access it in the ScaleClass
			var options = this.options;

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
			this.buildScale(data.labels);

			//Create a new bar for each piece of data
			helpers.each(this.data.datasets,function(dataset,datasetIndex){
				dataset.metaData = [];
				helpers.each(dataset.data,function(dataPoint,index){
					dataset.metaData.push(new this.BarClass());
				},this);
			},this);

			// Set defaults for bars
			this.eachBars(function(bar, index, datasetIndex){
				helpers.extend(bar, {
					width : this.scale.calculateBarWidth(this.data.datasets.length),
					x: this.scale.calculateBarX(this.data.datasets.length, datasetIndex, index),
					y: this.calculateBarBase(),
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
				opacity:0,
				xPadding: this.options.tooltipXPadding,
				yPadding: this.options.tooltipYPadding,
				xOffset: this.options.tooltipXOffset,
				backgroundColor: this.options.tooltipBackgroundColor,
				textColor: this.options.tooltipFontColor,
				_fontFamily: this.options.tooltipFontFamily,
				_fontStyle: this.options.tooltipFontStyle,
				fontSize: this.options.tooltipFontSize,
				titleTextColor: this.options.tooltipTitleFontColor,
				_titleFontFamily: this.options.tooltipTitleFontFamily,
				_titleFontStyle: this.options.tooltipTitleFontStyle,
				titleFontSize: this.options.tooltipTitleFontSize,
				caretHeight: this.options.tooltipCaretSize,
				cornerRadius: this.options.tooltipCornerRadius,
				legendColorBackground : this.options.multiTooltipKeyBackground,
			}, this);

			// Update the chart with the latest data.
			this.update();
		},
		onHover: function(e){


			// If exiting chart
			if(e.type == 'mouseout'){
				return false;
			}

			// Find Active Elements
			this.active = function(){
				switch(this.options.hoverMode){
					case 'single':
						return this.getBarAtEvent(e);
					case 'label':
						return this.getBarsAtEvent(e);
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
			if(this.lastActive){
				switch(this.options.hoverMode){
					case 'single':
						this.lastActive[0].backgroundColor = this.data.datasets[this.lastActive[0]._datasetIndex].backgroundColor;
						this.lastActive[0].borderColor = this.data.datasets[this.lastActive[0]._datasetIndex].borderColor;
						this.lastActive[0].borderWidth = 0;
						break;
					case 'label':
						break;
					case 'dataset':
						break;
					default:
						// do nothing
				}
			}
			
			// Built in hover actions
			if(this.active && this.options.hoverMode){
				switch(this.options.hoverMode){
					case 'single':
						this.active[0].backgroundColor = this.data.datasets[this.active[0]._datasetIndex].hoverBackgroundColor || helpers.color(this.active[0].backgroundColor).saturate(0.5).darken(0.25).rgbString();
						this.active[0].borderColor = this.data.datasets[this.active[0]._datasetIndex].hoverBorderColor || helpers.color(this.active[0].borderColor).saturate(0.5).darken(0.25).rgbString();
						break;
					case 'label':
						break;
					case 'dataset':
						break;
					default:
						// do nothing
				}
			}


			// Built in Tooltips
			if(this.options.showTooltips){

				// The usual updates
				this.tooltip.initialize();

				// Active
				if(this.active){
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
						_active: false,
					});
				}
			}

			// Only animate for major events
			if(!this.animating){
				// If entering
				if(!this.lastActive && this.active){
					console.log('entering');
					this.render(false, this.options.hoverAnimationDuration);
				}

				var changed = false;

				if (this.active.length !== this.lastActive.length){
						changed = true;
				}
				
				helpers.each(this.active, function(element, index){
					if (element !== this.lastActive[index]){
						changed = true;
					}
				}, this);

				// If different element
				if(this.lastActive && this.active && changed){
					console.log('changing');
					this.render(false, this.options.hoverAnimationDuration);
				}

				// if Leaving
				if (this.lastActive && !this.active){
					console.log('leaving');
					this.render(false, this.options.hoverAnimationDuration);
				}
			}

			// Remember Last Active
			this.lastActive = this.active;
		},
		// Calculate the base point for the bar.
		// If the scale has a 0 point, use that as the base
		// If the scale min and max are both positive, use the bottom as a base
		// If the scale min and max are both negative, use the top as a base
		calculateBarBase: function() {
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

			this.eachBars(function(bar, index, datasetIndex){
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
					_start: undefined
				});
			}, this);


			this.render();
		},
		eachBars : function(callback){
			helpers.each(this.data.datasets,function(dataset, datasetIndex){
				helpers.each(dataset.metaData, callback, this, datasetIndex);
			},this);
		},
		eachValue : function(callback){
			helpers.each(this.data.datasets,function(dataset, datasetIndex){
				helpers.each(dataset.data, callback, this, datasetIndex);
			},this);
		},
		getBarsAtEvent : function(e){
			var barsArray = [],
				eventPosition = helpers.getRelativePosition(e),
				datasetIterator = function(dataset){
					barsArray.push(dataset.metaData[elementIndex]);
				},
				elementIndex;

			for (var datasetIndex = 0; datasetIndex < this.data.datasets.length; datasetIndex++) {
				for (elementIndex = 0; elementIndex < this.data.datasets[datasetIndex].metaData.length; elementIndex++) {
					if (this.data.datasets[datasetIndex].metaData[elementIndex].inRange(eventPosition.x,eventPosition.y)){
						helpers.each(this.data.datasets, datasetIterator);
					}
				}
			}

			return barsArray.length ? barsArray : false;
		},
		// Get the single bar that was clicked on
		// @return : An object containing the dataset index and bar index of the matching bar. Also contains the rectangle that was drawn
		getBarAtEvent : function(e) {
			var bar = [];
			var eventPosition = helpers.getRelativePosition(e);
			
			for (var datasetIndex = 0; datasetIndex < this.data.datasets.length; ++datasetIndex) {
				for (var elementIndex = 0; elementIndex < this.data.datasets[datasetIndex].metaData.length; ++elementIndex) {
					if (this.data.datasets[datasetIndex].metaData[elementIndex].inRange(eventPosition.x, eventPosition.y)) {
						bar.push(this.data.datasets[datasetIndex].metaData[elementIndex]);
						return bar;
					}
				}
			}
			
			return false;
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
		/*reflow : function(){
			helpers.extend(this.BarClass.prototype,{
				y: this.calculateBarBase(), // so that we animate from the baseline
				base : this.calculateBarBase()
			});
			var newScaleProps = helpers.extend({
				height : this.chart.height,
				width : this.chart.width
			});
			this.scale.update(newScaleProps);
		},*/
		draw : function(ease){

			var easingDecimal = ease || 1;
			this.clear();

			this.scale.draw(easingDecimal);

			//Draw all the bars for each dataset
			this.eachBars(function(bar, index, datasetIndex){
				if (bar.hasValue()){
					// Update the bar basepoint
					bar.base = this.calculateBarBase();
					//Transition 
					bar.transition(easingDecimal).draw();
				}
			}, this);

			// Finally draw the tooltip
			this.tooltip.transition(easingDecimal).draw();
		}
	});


}).call(this);

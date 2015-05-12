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

		//String - Hover mode for events
		hoverMode : 'bars', // 'bar', 'dataset'

		//Function - Custom hover handler
		onHover : null,

		//Function - Custom hover handler
		hoverDuration : 400,

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
				calculateBarX : function(datasetCount, datasetIndex, barIndex){
					//Reusable method for calculating the xPosition of a given bar based on datasetIndex & width of the bar
					var xWidth = this.calculateBaseWidth(),
						xAbsolute = this.calculateX(barIndex) - (xWidth/2),
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

			//Set up tooltip events on the chart
			if (this.options.showTooltips){
				helpers.bindEvents(this, this.options.tooltipEvents, this.onHover);
			}


			
			//Declare the extension of the default point, to cater for the options passed in to the constructor
			this.BarClass = Chart.Rectangle.extend({
				ctx : this.chart.ctx,
				_vm: {}
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
				});
				// Copy to view model
				bar.save();
			}, this);

			this.update();
		},
		onHover: function(e){

			var active;
			if(e.type == 'mouseout'){
				return false;
			}
			if(this.options.hoverMode == 'bar'){
				active = this.getBarAtEvent(e);
			}
			else if(this.options.hoverMode == 'bars'){}


			// Remove styling for last active
			if(this.lastActive){
				if(this.options.hoverMode == 'bar'){
					this.lastActive.rectangle.backgroundColor = this.data.datasets[this.lastActive.datasetIndex].backgroundColor;
					this.lastActive.rectangle.borderColor = this.data.datasets[this.lastActive.datasetIndex].borderColor;
					this.lastActive.rectangle.borderWidth = 0;
				}
				else if(this.options.hoverMode == 'bars'){}
			}

			// Custom Hover actions
			if(this.options.onHover){
				this.options.onHover.call(this, active);
			}
			else if(active){
				// or default hover action
				if(this.options.hoverMode == 'bar'){
					active.rectangle.backgroundColor = this.data.datasets[active.datasetIndex].hoverBackgroundColor || Color(active.rectangle.backgroundColor).saturate(0.5).darken(0.25).rgbString();
					active.rectangle.borderColor = this.data.datasets[active.datasetIndex].hoverBorderColor || Color(active.rectangle.borderColor).saturate(0.5).darken(0.25).rgbString();
				}
				else if(this.options.hoverMode == 'bars'){}

			}

			if(!this.animating){
				// If entering
				if(!this.lastActive && active){
					this.render(false, this.options.hoverDuration);
				}

				// If different bar
				if(this.lastActive && active && this.lastActive.rectangle !== active.rectangle){
					this.render(false, this.options.hoverDuration);
				}

				// if Leaving
				if (this.lastActive && !active){
					this.render(false, this.options.hoverDuration);
				}
			}

			this.lastActive = active;

			//this.showTooltip(active);
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
					barsArray.push(dataset.metaData[barIndex]);
				},
				barIndex;

			for (var datasetIndex = 0; datasetIndex < this.data.datasets.length; datasetIndex++) {
				for (barIndex = 0; barIndex < this.data.datasets[datasetIndex].metaData.length; barIndex++) {
					if (this.data.datasets[datasetIndex].metaData[barIndex].inRange(eventPosition.x,eventPosition.y)){
						helpers.each(this.data.datasets, datasetIterator);
						return barsArray;
					}
				}
			}

			return barsArray;
		},
		// Get the single bar that was clicked on
		// @return : An object containing the dataset index and bar index of the matching bar. Also contains the rectangle that was drawn
		getBarAtEvent : function(e) {
			var bar;
			var eventPosition = helpers.getRelativePosition(e);
			
			for (var datasetIndex = 0; datasetIndex < this.data.datasets.length; ++datasetIndex) {
				for (var barIndex = 0; barIndex < this.data.datasets[datasetIndex].metaData.length; ++barIndex) {
					if (this.data.datasets[datasetIndex].metaData[barIndex].inRange(eventPosition.x, eventPosition.y)) {
						bar = {
							rectangle : this.data.datasets[datasetIndex].metaData[barIndex],
							datasetIndex : datasetIndex,
							barIndex : barIndex,
						};
						return bar;
					}
				}
			}
			
			return bar;
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
		addData : function(valuesArray,label){
			//Map the values array for each of the datasets
			helpers.each(valuesArray,function(value,datasetIndex){
				//Add a new point for each piece of data, passing any required data to draw.
				this.data.datasets[datasetIndex].bars.push(new this.BarClass({
					value : value,
					label : label,
					datasetLabel: this.data.datasets[datasetIndex].label,
					x: this.scale.calculateBarX(this.data.datasets.length, datasetIndex, this.scale.valuesCount+1),
					y: this.calculateBarBase(),
					width : this.scale.calculateBarWidth(this.data.datasets.length),
					base : this.calculateBarBase(),
					borderColor : this.data.datasets[datasetIndex].borderColor,
					backgroundColor : this.data.datasets[datasetIndex].backgroundColor
				}));
			},this);

			this.scale.addXLabel(label);
			//Then re-render the chart.
			this.update();
		},
		removeData : function(){
			this.scale.removeXLabel();
			//Then re-render the chart.
			helpers.each(this.data.datasets,function(dataset){
				dataset.bars.shift();
			},this);
			this.update();
		},
		reflow : function(){
			helpers.extend(this.BarClass.prototype,{
				y: this.calculateBarBase(), // so that we animate from the baseline
				base : this.calculateBarBase()
			});
			var newScaleProps = helpers.extend({
				height : this.chart.height,
				width : this.chart.width
			});
			this.scale.update(newScaleProps);
		},
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
					bar.transition([
						'x',
						'y',
						'width',
						'backgroundColor',
						'borderColor',
					 	'borderWidth'
					], easingDecimal).draw();
				}
			}, this);
		}
	});


}).call(this);

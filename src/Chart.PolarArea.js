(function(){
	"use strict";

	var root = this,
		Chart = root.Chart,
		//Cache a local reference to Chart.helpers
		helpers = Chart.helpers;

	var defaultConfig = {
		//Boolean - Stroke a line around each segment in the chart
		segmentShowStroke : true,

		//String - The colour of the stroke on each segment.
		segmentStrokeColor : "#fff",

		//Number - The width of the stroke value in pixels
		segmentStrokeWidth : 2,

		scale: {
			scaleType: "radialLinear",
			display: true,
			
			//Boolean - Whether to animate scaling the chart from the centre
			animate : false,

			lineArc: true,
    
            // grid line settings
            gridLines: {
                show: true,
                color: "rgba(0, 0, 0, 0.05)",
                lineWidth: 1,
            },

            // scale numbers
            beginAtZero: true,

            // label settings
            labels: {
                show: true,
                template: "<%=value%>",
                fontSize: 12,
                fontStyle: "normal",
                fontColor: "#666",
                fontFamily: "Helvetica Neue",

				//Boolean - Show a backdrop to the scale label
				showLabelBackdrop : true,

				//String - The colour of the label backdrop
				backdropColor : "rgba(255,255,255,0.75)",

				//Number - The backdrop padding above & below the label in pixels
				backdropPaddingY : 2,

				//Number - The backdrop padding to the side of the label in pixels
				backdropPaddingX : 2,
            }
		},

		//Number - Amount of animation steps
		animationSteps : 100,

		//String - Animation easing effect.
		animationEasing : "easeOutBounce",

		//Boolean - Whether to animate the rotation of the chart
		animateRotate : true,

		//String - A legend template
		legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li><span style=\"background-color:<%=segments[i].fillColor%>\"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>"
	};


	Chart.Type.extend({
		//Passing in a name registers this chart in the Chart namespace
		name: "PolarArea",
		//Providing a defaults will also register the deafults in the chart namespace
		defaults : defaultConfig,
		//Initialize is fired when the chart is initialized - Data is passed in as a parameter
		//Config is automatically merged by the core of Chart.js, and is available at this.options
		initialize:  function(){
			this.segments = [];
			//Declare segment class as a chart instance specific class, so it can share props for this instance
			this.SegmentArc = Chart.Arc.extend({
				showStroke : this.options.segmentShowStroke,
				strokeWidth : this.options.segmentStrokeWidth,
				strokeColor : this.options.segmentStrokeColor,
				ctx : this.chart.ctx,
				innerRadius : 0,
				x : this.chart.width/2,
				y : this.chart.height/2
			});

			var self = this;
			var ScaleClass = Chart.scales.getScaleConstructor(this.options.scale.scaleType);
			this.scale = new ScaleClass({
				options: this.options.scale,
				lineArc: true,
				width: this.chart.width,
				height: this.chart.height,
				xCenter: this.chart.width/2,
				yCenter: this.chart.height/2,
				ctx : this.chart.ctx,
				valuesCount: this.data.length,
				calculateRange: function() {
					this.min = null;
					this.max = null;

					helpers.each(self.data, function(data) {
                        if (this.min === null) {
                            this.min = data.value;
                        } else if (data.value < this.min) {
                            this.min = data.value;
                        }
                        
                        if (this.max === null) {
                            this.max = data.value;
                        } else if (data.value > this.max) {
                            this.max = data.value;
                        }
                    }, this);
				}
			});

			this.updateScaleRange();
			this.scale.calculateRange();
			this.scale.generateTicks();
			this.scale.buildYLabels();

			helpers.each(this.data,function(segment,index){
				this.addData(segment,index,true);
			},this);

			//Set up tooltip events on the chart
			if (this.options.tooltips.enabled){
				helpers.bindEvents(this, this.options.events, function(evt){
					var activeSegments = (evt.type !== 'mouseout') ? this.getSegmentsAtEvent(evt) : [];
					helpers.each(this.segments,function(segment){
						segment.restore(["fillColor"]);
					});

					helpers.each(activeSegments,function(activeSegment){
						activeSegment.fillColor = activeSegment.highlightColor;
					});

					this.showTooltip(activeSegments);
				});
			}

			this.render();
		},
		getSegmentsAtEvent : function(e){
			var segmentsArray = [];
			var location = helpers.getRelativePosition(e);

			helpers.each(this.segments,function(segment){
				if (segment.inRange(location.x,location.y)) segmentsArray.push(segment);
			},this);

			return segmentsArray;
		},
		addData : function(segment, atIndex, silent){
			var index = atIndex || this.segments.length;

			this.segments.splice(index, 0, new this.SegmentArc({
				fillColor: segment.color,
				highlightColor: segment.highlight || segment.color,
				label: segment.label,
				value: segment.value,
				outerRadius: (this.options.animateScale) ? 0 : this.scale.calculateCenterOffset(segment.value),
				circumference: (this.options.animateRotate) ? 0 : this.scale.getCircumference(),
				startAngle: Math.PI * 1.5
			}));
			if (!silent){
				this.reflow();
				this.update();
			}
		},
		removeData: function(atIndex){
			var indexToDelete = (helpers.isNumber(atIndex)) ? atIndex : this.segments.length-1;
			this.segments.splice(indexToDelete, 1);
			this.reflow();
			this.update();
		},
		calculateTotal: function(data){
			this.total = 0;
			helpers.each(data,function(segment){
				this.total += segment.value;
			},this);
			this.scale.valuesCount = this.segments.length;
		},
		updateScaleRange: function(){
			helpers.extend(this.scale, {
				size: helpers.min([this.chart.width, this.chart.height]),
				xCenter: this.chart.width/2,
				yCenter: this.chart.height/2
			});

		},
		update : function(){

			// Map new data to data points
			if(this.data.length == this.segments.length){
				helpers.each(this.data, function(segment, i){
					helpers.extend(this.segments[i], {
						fillColor: segment.color,
						highlightColor: segment.highlight || segment.color,
						label: segment.label,
						value: segment.value,
					});
				},this);
			} else{
				// Data size changed without properly inserting, just redraw the chart
				this.initialize(this.data);
			}

			this.calculateTotal(this.segments);

			helpers.each(this.segments,function(segment){
				segment.save();
			});
			
			this.reflow();
			this.render();
		},
		reflow : function(){
			helpers.extend(this.SegmentArc.prototype,{
				x : this.chart.width/2,
				y : this.chart.height/2
			});
			
			this.updateScaleRange();
			this.scale.calculateRange();
			this.scale.generateTicks();
			this.scale.buildYLabels();

			helpers.extend(this.scale,{
				xCenter: this.chart.width/2,
				yCenter: this.chart.height/2
			});

			helpers.each(this.segments, function(segment){
				//segment.update({
				//	outerRadius : this.scale.calculateCenterOffset(segment.value)
				//});
				helpers.extend(segment, {
					outerRadius: this.scale.calculateCenterOffset(segment.value)
				});
			}, this);

		},
		draw : function(ease){
			var easingDecimal = ease || 1;
			//Clear & draw the canvas
			this.clear();
			helpers.each(this.segments,function(segment, index){
				segment.transition({
					circumference : this.scale.getCircumference(),
					outerRadius : this.scale.calculateCenterOffset(segment.value)
				},easingDecimal);

				segment.endAngle = segment.startAngle + segment.circumference;

				// If we've removed the first segment we need to set the first one to
				// start at the top.
				if (index === 0){
					segment.startAngle = Math.PI * 1.5;
				}

				//Check to see if it's the last segment, if not get the next and update the start angle
				if (index < this.segments.length - 1){
					this.segments[index+1].startAngle = segment.endAngle;
				}
				segment.draw();
			}, this);
			this.scale.draw();
		}
	});

}).call(this);

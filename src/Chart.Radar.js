(function(){
	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;



	Chart.Type.extend({
		name: "Radar",
		defaults:{

			scale: {
				scaleType: "radialLinear",
				display: true,
				
				//Boolean - Whether to animate scaling the chart from the centre
				animate : false,

				lineArc: false,

				// grid line settings
				gridLines: {
					show: true,
					color: "rgba(0, 0, 0, 0.05)",
					lineWidth: 1,
				},

				angleLines: {
					show: true,
					color: "rgba(0,0,0,.1)",
					lineWidth: 1
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
				},
				
				pointLabels: {
					//String - Point label font declaration
					fontFamily : "'Arial'",

					//String - Point label font weight
					fontStyle : "normal",

					//Number - Point label font size in pixels
					fontSize : 10,

					//String - Point label font colour
					fontColor : "#666",
				},
			},

			//Boolean - Whether to show a dot for each point
			pointDot : true,

			//Number - Radius of each point dot in pixels
	        pointRadius: 3,

	        //Number - Pixel width of point dot border
	        pointBorderWidth: 1,

	        //Number - Pixel width of point on hover
	        pointHoverRadius: 5,

	        //Number - Pixel width of point dot border on hover
	        pointHoverBorderWidth: 2,
	        pointBackgroundColor: Chart.defaults.global.defaultColor,
	        pointBorderColor: Chart.defaults.global.defaultColor,

	        //Number - amount extra to add to the radius to cater for hit detection outside the drawn point
	        pointHitRadius: 20,

			//Boolean - Whether to show a stroke for datasets
			datasetStroke : true,

			//Number - Pixel width of dataset stroke
			datasetStrokeWidth : 2,

			//Boolean - Whether to fill the dataset with a colour
			datasetFill : true,

			//String - A legend template
			legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"

		},

		initialize: function(){
			this.PointClass = Chart.Point.extend({
				display: this.options.pointDot,
				_chart: this.chart
			});

			this.datasets = [];

			this.buildScale(this.data);

			//Set up tooltip events on the chart
			if (this.options.showTooltips){
				helpers.bindEvents(this, this.options.events, function(evt){
					var activePointsCollection = (evt.type !== 'mouseout') ? this.getPointsAtEvent(evt) : [];

					this.eachPoints(function(point){
						point.restore(['fillColor', 'strokeColor']);
					});
					helpers.each(activePointsCollection, function(activePoint){
						activePoint.fillColor = activePoint.highlightFill;
						activePoint.strokeColor = activePoint.highlightStroke;
					});

					this.showTooltip(activePointsCollection);
				});
			}

			//Iterate through each of the datasets, and build this into a property of the chart
			helpers.each(this.data.datasets,function(dataset){

				var datasetObject = {
					label: dataset.label || null,
					fillColor : dataset.fillColor,
					strokeColor : dataset.strokeColor,
					pointColor : dataset.pointColor,
					pointStrokeColor : dataset.pointStrokeColor,
					points : []
				};

				this.datasets.push(datasetObject);

				helpers.each(dataset.data,function(dataPoint,index){
					//Add a new point for each piece of data, passing any required data to draw.
					var pointPosition;
					if (!this.scale.animation){
						pointPosition = this.scale.getPointPosition(index, this.scale.calculateCenterOffset(dataPoint));
					}
					datasetObject.points.push(new this.PointClass({
						value : dataPoint,
						label : this.data.labels[index],
						datasetLabel: dataset.label,
						x: (this.options.animation) ? this.scale.xCenter : pointPosition.x,
						y: (this.options.animation) ? this.scale.yCenter : pointPosition.y,
						strokeColor : dataset.pointStrokeColor,
						fillColor : dataset.pointColor,
						highlightFill : dataset.pointHighlightFill || dataset.pointColor,
						highlightStroke : dataset.pointHighlightStroke || dataset.pointStrokeColor,

						// Appearance
                    	radius: dataset.pointRadius || this.options.pointRadius,
                    	backgroundColor: dataset.pointBackgroundColor || this.options.pointBackgroundColor,
                    	borderWidth: dataset.pointBorderWidth || this.options.pointBorderWidth,
                    
                    	// Tooltip
                    	hoverRadius: dataset.pointHitRadius || this.options.pointHitRadius,
					}));
				},this);

			},this);

			this.render();
		},
		eachPoints : function(callback){
			helpers.each(this.datasets,function(dataset){
				helpers.each(dataset.points,callback,this);
			},this);
		},

		getPointsAtEvent : function(evt){
			var mousePosition = helpers.getRelativePosition(evt),
				fromCenter = helpers.getAngleFromPoint({
					x: this.scale.xCenter,
					y: this.scale.yCenter
				}, mousePosition);

			var anglePerIndex = (Math.PI * 2) /this.scale.valuesCount,
				pointIndex = Math.round((fromCenter.angle - Math.PI * 1.5) / anglePerIndex),
				activePointsCollection = [];

			// If we're at the top, make the pointIndex 0 to get the first of the array.
			if (pointIndex >= this.scale.valuesCount || pointIndex < 0){
				pointIndex = 0;
			}

			if (fromCenter.distance <= this.scale.drawingArea){
				helpers.each(this.datasets, function(dataset){
					activePointsCollection.push(dataset.points[pointIndex]);
				});
			}

			return activePointsCollection;
		},

		buildScale : function(data){
			var self = this;

			var ScaleConstructor = Chart.scales.getScaleConstructor(this.options.scale.scaleType);
			this.scale = new ScaleConstructor({
				options: this.options.scale,
				height : this.chart.height,
				width: this.chart.width,
				xCenter: this.chart.width/2,
				yCenter: this.chart.height/2,
				ctx : this.chart.ctx,
				labels: data.labels,
				valuesCount: data.datasets[0].data.length,
				calculateRange: function() {
					this.min = null;
					this.max = null;

					helpers.each(self.data.datasets, function(dataset) {
                        if (dataset.yAxisID === this.id) {
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
                        }
                    }, this);
				}
			});

			this.scale.setScaleSize();
			this.scale.calculateRange();
			this.scale.generateTicks();
			this.scale.buildYLabels();
		},
		addData : function(valuesArray,label){
			//Map the values array for each of the datasets
			this.scale.valuesCount++;
			helpers.each(valuesArray,function(value,datasetIndex){
				var pointPosition = this.scale.getPointPosition(this.scale.valuesCount, this.scale.calculateCenterOffset(value));
				this.datasets[datasetIndex].points.push(new this.PointClass({
					value : value,
					label : label,
					datasetLabel: this.datasets[datasetIndex].label,
					x: pointPosition.x,
					y: pointPosition.y,
					strokeColor : this.datasets[datasetIndex].pointStrokeColor,
					fillColor : this.datasets[datasetIndex].pointColor
				}));
			},this);

			this.scale.labels.push(label);

			this.reflow();

			this.update();
		},
		removeData : function(){
			this.scale.valuesCount--;
			this.scale.labels.shift();
			helpers.each(this.datasets,function(dataset){
				dataset.points.shift();
			},this);
			this.reflow();
			this.update();
		},
		update : function(){
			//Iterate through each of the datasets, and build this into a property of the chart
			helpers.each(this.data.datasets,function(dataset,datasetIndex){

				helpers.extend(this.datasets[datasetIndex], {
					label : dataset.label || null,
					fillColor : dataset.fillColor,
					strokeColor : dataset.strokeColor,
					pointColor : dataset.pointColor,
					pointStrokeColor : dataset.pointStrokeColor,
				});

				helpers.each(dataset.data,function(dataPoint,index){
					helpers.extend(this.datasets[datasetIndex].points[index], {
						value : dataPoint,
						label : this.data.labels[index],
						datasetLabel: dataset.label,
						strokeColor : dataset.pointStrokeColor,
						fillColor : dataset.pointColor,
						highlightFill : dataset.pointHighlightFill || dataset.pointColor,
						highlightStroke : dataset.pointHighlightStroke || dataset.pointStrokeColor
					});
				},this);

			},this);
			
			this.eachPoints(function(point){
				point.save();
			});
			this.reflow();
			this.render();
		},
		reflow: function(){
			helpers.extend(this.scale, {
				width : this.chart.width,
				height: this.chart.height,
				size : helpers.min([this.chart.width, this.chart.height]),
				xCenter: this.chart.width/2,
				yCenter: this.chart.height/2
			});
			
			this.scale.calculateRange();
			this.scale.generateTicks();
			this.scale.buildYLabels();
		},
		draw : function(ease){
			var easeDecimal = ease || 1,
				ctx = this.chart.ctx;
			this.clear();
			this.scale.draw();

			helpers.each(this.datasets,function(dataset){

				//Transition each point first so that the line and point drawing isn't out of sync
				helpers.each(dataset.points,function(point,index){
					if (point.hasValue()){
						point.transition(easeDecimal);
					}
				},this);



				//Draw the line between all the points
				ctx.lineWidth = this.options.datasetStrokeWidth;
				ctx.strokeStyle = dataset.strokeColor;
				ctx.beginPath();
				helpers.each(dataset.points,function(point,index){
					if (index === 0){
						ctx.moveTo(point.x,point.y);
					}
					else{
						ctx.lineTo(point.x,point.y);
					}
				},this);
				ctx.closePath();
				ctx.stroke();

				ctx.fillStyle = dataset.fillColor;
				ctx.fill();

				//Now draw the points over the line
				//A little inefficient double looping, but better than the line
				//lagging behind the point positions
				helpers.each(dataset.points,function(point){
					if (point.hasValue()){
						point.draw();
					}
				});

			},this);

		}

	});





}).call(this);

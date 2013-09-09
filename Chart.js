/*!
 * Chart.js
 * http://chartjs.org/
 *
 * Copyright 2013 Nick Downie
 * Released under the MIT license
 * https://github.com/nnnick/Chart.js/blob/master/LICENSE.md
 */

//Define the global Chart Variable as a class.
window.Chart = function(context, options){
	var chart = this;
	
	//Easing functions adapted from Robert Penner's easing equations
	//http://www.robertpenner.com/easing/
	
	var animationOptions = {
		linear : function (t){
			return t;
		},
		easeInQuad: function (t) {
			return t*t;
		},
		easeOutQuad: function (t) {
			return -1 *t*(t-2);
		},
		easeInOutQuad: function (t) {
			if ((t/=1/2) < 1) return 1/2*t*t;
			return -1/2 * ((--t)*(t-2) - 1);
		},
		easeInCubic: function (t) {
			return t*t*t;
		},
		easeOutCubic: function (t) {
			return 1*((t=t/1-1)*t*t + 1);
		},
		easeInOutCubic: function (t) {
			if ((t/=1/2) < 1) return 1/2*t*t*t;
			return 1/2*((t-=2)*t*t + 2);
		},
		easeInQuart: function (t) {
			return t*t*t*t;
		},
		easeOutQuart: function (t) {
			return -1 * ((t=t/1-1)*t*t*t - 1);
		},
		easeInOutQuart: function (t) {
			if ((t/=1/2) < 1) return 1/2*t*t*t*t;
			return -1/2 * ((t-=2)*t*t*t - 2);
		},
		easeInQuint: function (t) {
			return 1*(t/=1)*t*t*t*t;
		},
		easeOutQuint: function (t) {
			return 1*((t=t/1-1)*t*t*t*t + 1);
		},
		easeInOutQuint: function (t) {
			if ((t/=1/2) < 1) return 1/2*t*t*t*t*t;
			return 1/2*((t-=2)*t*t*t*t + 2);
		},
		easeInSine: function (t) {
			return -1 * Math.cos(t/1 * (Math.PI/2)) + 1;
		},
		easeOutSine: function (t) {
			return 1 * Math.sin(t/1 * (Math.PI/2));
		},
		easeInOutSine: function (t) {
			return -1/2 * (Math.cos(Math.PI*t/1) - 1);
		},
		easeInExpo: function (t) {
			return (t==0) ? 1 : 1 * Math.pow(2, 10 * (t/1 - 1));
		},
		easeOutExpo: function (t) {
			return (t==1) ? 1 : 1 * (-Math.pow(2, -10 * t/1) + 1);
		},
		easeInOutExpo: function (t) {
			if (t==0) return 0;
			if (t==1) return 1;
			if ((t/=1/2) < 1) return 1/2 * Math.pow(2, 10 * (t - 1));
			return 1/2 * (-Math.pow(2, -10 * --t) + 2);
			},
		easeInCirc: function (t) {
			if (t>=1) return t;
			return -1 * (Math.sqrt(1 - (t/=1)*t) - 1);
		},
		easeOutCirc: function (t) {
			return 1 * Math.sqrt(1 - (t=t/1-1)*t);
		},
		easeInOutCirc: function (t) {
			if ((t/=1/2) < 1) return -1/2 * (Math.sqrt(1 - t*t) - 1);
			return 1/2 * (Math.sqrt(1 - (t-=2)*t) + 1);
		},
		easeInElastic: function (t) {
			var s=1.70158;var p=0;var a=1;
			if (t==0) return 0;  if ((t/=1)==1) return 1;  if (!p) p=1*.3;
			if (a < Math.abs(1)) { a=1; var s=p/4; }
			else var s = p/(2*Math.PI) * Math.asin (1/a);
			return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*1-s)*(2*Math.PI)/p ));
		},
		easeOutElastic: function (t) {
			var s=1.70158;var p=0;var a=1;
			if (t==0) return 0;  if ((t/=1)==1) return 1;  if (!p) p=1*.3;
			if (a < Math.abs(1)) { a=1; var s=p/4; }
			else var s = p/(2*Math.PI) * Math.asin (1/a);
			return a*Math.pow(2,-10*t) * Math.sin( (t*1-s)*(2*Math.PI)/p ) + 1;
		},
		easeInOutElastic: function (t) {
			var s=1.70158;var p=0;var a=1;
			if (t==0) return 0;  if ((t/=1/2)==2) return 1;  if (!p) p=1*(.3*1.5);
			if (a < Math.abs(1)) { a=1; var s=p/4; }
			else var s = p/(2*Math.PI) * Math.asin (1/a);
			if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*1-s)*(2*Math.PI)/p ));
			return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*1-s)*(2*Math.PI)/p )*.5 + 1;
		},
		easeInBack: function (t) {
			var s = 1.70158;
			return 1*(t/=1)*t*((s+1)*t - s);
		},
		easeOutBack: function (t) {
			var s = 1.70158;
			return 1*((t=t/1-1)*t*((s+1)*t + s) + 1);
		},
		easeInOutBack: function (t) {
			var s = 1.70158; 
			if ((t/=1/2) < 1) return 1/2*(t*t*(((s*=(1.525))+1)*t - s));
			return 1/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2);
		},
		easeInBounce: function (t) {
			return 1 - animationOptions.easeOutBounce (1-t);
		},
		easeOutBounce: function (t) {
			if ((t/=1) < (1/2.75)) {
				return 1*(7.5625*t*t);
			} else if (t < (2/2.75)) {
				return 1*(7.5625*(t-=(1.5/2.75))*t + .75);
			} else if (t < (2.5/2.75)) {
				return 1*(7.5625*(t-=(2.25/2.75))*t + .9375);
			} else {
				return 1*(7.5625*(t-=(2.625/2.75))*t + .984375);
			}
		},
		easeInOutBounce: function (t) {
			if (t < 1/2) return animationOptions.easeInBounce (t*2) * .5;
			return animationOptions.easeOutBounce (t*2-1) * .5 + 1*.5;
		}
	};

	this.tooltips = [],
	defaults = {
		tooltips: {
			background: 'black',
			fontFamily : "'Arial'",
			fontStyle : "normal",
			fontColor: 'white',
			fontSize: '12px',
			labelTemplate: '<%=label%>: <%=value%>',
			height: 24,
			padding: {
				top: 4,
				right: 8,
				bottom: 4,
				left: 8
			},
			position: 'bottom center',
			offset: {
				left: 0,
				top: 0
			},
			border: {
				width: 0,
				color: 'black',
				radius: 4
			},
			showShadow: true,
			shadow: {
				color: 'rgba(0,0,0,0.9)',
				blur: 8,
				offsetX: 0,
				offsetY: 0
			},
			showHighlight: true,
			highlight: {
				stroke: {
					width: 1,
					color: 'rgba(230,230,230,0.25)'
				},
				fill: 'rgba(255,255,255,0.25)'
			}
		}
	},
	options = (options) ? mergeChartConfig(defaults, options) : defaults;

	function registerTooltip(ctx,areaObj,data,type) {
		chart.tooltips.push(new Tooltip(
			ctx,
			areaObj,
			data,
			type
		));
	}

	var Tooltip = function(ctx, areaObj, data, type) {
		this.ctx = ctx;
		this.areaObj = areaObj;
		this.data = data;
		this.savedState = null;
		this.highlightState = null;
		this.x = null;
		this.y = null;

		this.inRange = function(x,y) {
			if(this.areaObj.type) {
				switch(this.areaObj.type) {
					case 'rect':
						return (x >= this.areaObj.x && x <= this.areaObj.x+this.areaObj.width) &&
						   (y >= this.areaObj.y && y <= this.areaObj.y+this.areaObj.height);
						   break;
					case 'circle':
						return ((Math.pow(x-this.areaObj.x, 2)+Math.pow(y-this.areaObj.y, 2)) < Math.pow(this.areaObj.r,2));
						break;
					case 'shape':
						var poly = this.areaObj.points;
						for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
							((poly[i].y <= y && y < poly[j].y) || (poly[j].y <= y && y < poly[i].y))
							&& (x < (poly[j].x - poly[i].x) * (y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
							&& (c = !c);
						return c;
						break;
				}
			}
		}

		this.render = function(x,y) {
			this.ctx.shadowColor = undefined;
			this.ctx.shadowBlur = 0;
			this.ctx.shadowOffsetX = 0;
			this.ctx.shadowOffsetY = 0;
			if(this.savedState == null) {
				this.ctx.putImageData(chart.savedState,0,0);
				this.savedState = this.ctx.getImageData(0,0,this.ctx.canvas.width,this.ctx.canvas.height);
			}
			this.ctx.putImageData(this.savedState,0,0);
			if(options.tooltips.showHighlight) {
				if(this.highlightState == null) {
					this.ctx.strokeStyle = options.tooltips.highlight.stroke.color;
					this.ctx.lineWidth = options.tooltips.highlight.stroke.width;
					this.ctx.fillStyle = options.tooltips.highlight.fill;
					switch(this.areaObj.type) {
						case 'rect':
							this.ctx.strokeRect(this.areaObj.x, this.areaObj.y, this.areaObj.width, this.areaObj.height);
							this.ctx.fillStyle = options.tooltips.highlight.fill;
							this.ctx.fillRect(this.areaObj.x, this.areaObj.y, this.areaObj.width, this.areaObj.height);
							break;
						case 'circle':
							this.ctx.beginPath();
							this.ctx.arc(this.areaObj.x, this.areaObj.y, this.areaObj.r, 0, 2*Math.PI, false);
							this.ctx.stroke();
							this.ctx.fill();
							break;
						case 'shape':
							this.ctx.beginPath();
							this.ctx.moveTo(this.areaObj.points[0].x, this.areaObj.points[0].y);
							for(var p in this.areaObj.points) {
								this.ctx.lineTo(this.areaObj.points[p].x, this.areaObj.points[p].y);
							}
							this.ctx.stroke();
							this.ctx.fill();
							break;
					}
					this.highlightState = this.ctx.getImageData(0,0,this.ctx.canvas.width,this.ctx.canvas.height);
				} else {
					this.ctx.putImageData(this.highlightState,0,0);
				}
			}
			var posX = x+options.tooltips.offset.left,
				posY = y+options.tooltips.offset.top,
				tpl = tmpl(options.tooltips.labelTemplate, this.data),
				rectWidth = options.tooltips.padding.left+this.ctx.measureText(tpl).width+options.tooltips.padding.right,
				position = options.tooltips.position.split(" "),
				height = options.tooltips.height;

			// adjust height on fontsize
			if(options.tooltips.fontSize.match(/[0-9]+(.[0-9]+)?px/)) {
				height = parseInt(options.tooltips.fontSize);
			} else if(options.tooltips.fontSize.match(/[0-9]+(.[0-9]+)?(\%|em)/)) {
				function getDefaultFontSize(pa) {
					pa = pa || document.body;
					var who = document.createElement('div');

					who.style.cssText='display:inline-block; padding:0; line-height:1; position:absolute; visibility:hidden; font-size:1em';

					who.appendChild(document.createTextNode('M'));
					pa.appendChild(who);
					var fs = [who.offsetWidth, who.offsetHeight];
					pa.removeChild(who);
					return fs[1];
				}
				var size = parseFloat(options.tooltips.fontSize);
				if(options.tooltips.fontSize.match(/[0-9]+(.[0-9]+)?\%/)) {
					size /= 100;
				}
				height = size*getDefaultFontSize(this.ctx.canvas.parentNode);
			}

			height += options.tooltips.padding.top+options.tooltips.padding.bottom;

			// check relative position
			for(var i in position) {
				if(i == 0) {
					if(position[i] == "bottom") {
						posY -= height;
					} else if(position[i] == "center") {
						posY -= height/2;
						if(position.length == 1) {
							posX -= rectWidth/2;
						}
					}
				}
				if(i == 1) {
					if(position[i] == "right") {
						posX -= rectWidth;
					} else if(position[i] == "center") {
						posX -= rectWidth/2;
					}
				}
			}

			// check edges
			if(posX + rectWidth > ctx.canvas.width) {
				posX -= posX+rectWidth-ctx.canvas.width;
			}
			if(posX < 0) {
				posX = 0;
			}
			if(posY + height > ctx.canvas.height) {
				posY -= posY+height-ctx.canvas.height;
			}
			if(posY < 0) {
				posY = 0;
			}
			this.ctx.fillStyle = options.tooltips.background;
			if(options.tooltips.showShadow) {
				this.ctx.shadowColor = options.tooltips.shadow.color;
				this.ctx.shadowBlur = options.tooltips.shadow.blur;
				this.ctx.shadowOffsetX = options.tooltips.shadow.offsetX;
				this.ctx.shadowOffsetY = options.tooltips.shadow.offsetY;
			}
			if(!options.tooltips.border.radius) {
				this.ctx.fillRect(posX, posY, rectWidth, height);
				if(options.tooltips.border.width > 0) {
					this.ctx.fillStyle = options.tooltips.border.color;
					this.ctx.lineWidth = options.tooltips.border.width;
					this.ctx.strokeRect(posX, posY, rectWidth, height);
				}
			} else {
				var radius = options.tooltips.border.radius > 12 ? 12 : options.tooltips.border.radius;
				this.ctx.beginPath();
				this.ctx.moveTo(posX+radius, posY);
				this.ctx.lineTo(posX+rectWidth-radius, posY);
				this.ctx.quadraticCurveTo(posX+rectWidth, posY, posX+rectWidth, posY+radius);
				this.ctx.lineTo(posX+rectWidth, posY+height-radius);
				this.ctx.quadraticCurveTo(posX+rectWidth, posY+height, posX+rectWidth-radius, posY+height);
				this.ctx.lineTo(posX+radius, posY+height);
				this.ctx.quadraticCurveTo(posX, posY+height, posX, posY+height-radius);
				this.ctx.lineTo(posX, posY+radius);
				this.ctx.quadraticCurveTo(posX, posY, posX+radius, posY);
				this.ctx.fill();
				if(options.tooltips.border.width > 0) {
					this.ctx.strokeStyle = options.tooltips.border.color;
					this.ctx.lineWidth = options.tooltips.border.width;
					this.ctx.stroke();
				}
				this.ctx.closePath();
			}
			this.ctx.font = options.tooltips.fontStyle+ " "+options.tooltips.fontSize+" " + options.tooltips.fontFamily;
			this.ctx.fillStyle = options.tooltips.fontColor;
			this.ctx.textAlign = 'center';
			this.ctx.textBaseline = 'middle';
			this.ctx.fillText(tpl, posX+rectWidth/2, posY+height/2);
			this.x = x;
			this.y = y;
		}
	}

	//Variables global to the chart
	var width = context.canvas.width,
		height = context.canvas.height;

	this.savedState = null;

	function getPosition(e) {
		var xPosition = 0;
		var yPosition = 0;

		while(e) {
			xPosition += (e.offsetLeft + e.clientLeft);
			yPosition += (e.offsetTop + e.clientTop);
			e = e.offsetParent;
		}
		if(window.pageXOffset > 0 || window.pageYOffset > 0) {
			xPosition -= window.pageXOffset;
			yPosition -= window.pageYOffset;
		} else if(document.body.scrollLeft > 0 || document.body.scrollTop > 0) {
			xPosition -= document.body.scrollLeft;
			yPosition -= document.body.scrollTop;
		}
		return { x: xPosition, y: yPosition };
	}
	
	function tooltipEventHandler(e) {
		if(chart.tooltips.length > 0) {
			chart.savedState = chart.savedState == null ? context.getImageData(0,0,context.canvas.width,context.canvas.height) : chart.savedState;
			var rendered = 0;
			for(var i in chart.tooltips) {
				var position = getPosition(context.canvas),
					mx = (e.clientX)-position.x,
					my = (e.clientY)-position.y;
				if(chart.tooltips[i].inRange(mx,my)) {
					chart.tooltips[i].render(mx,my);
					rendered++;
				}
			}
			if(rendered == 0) {
				context.putImageData(chart.savedState,0,0);
			}
		}
	}

	if(window.Touch) {
		context.canvas.ontouchstart = function(e) {
			e.clientX = e.targetTouches[0].clientX;
			e.clientY = e.targetTouches[0].clientY;
			tooltipEventHandler(e);
		}
		context.canvas.ontouchmove = function(e) {
			e.clientX = e.targetTouches[0].clientX;
			e.clientY = e.targetTouches[0].clientY;
			tooltipEventHandler(e);
		}
	} else {
		context.canvas.onmousemove = function(e) {
			tooltipEventHandler(e);
		}
	}
	context.canvas.onmouseout = function(e) {
		if(chart.savedState != null) {
			context.putImageData(chart.savedState,0,0);
		}
	}


	//High pixel density displays - multiply the size of the canvas height/width by the device pixel ratio, then scale.
	if (window.devicePixelRatio) {
		context.canvas.style.width = width + "px";
		context.canvas.style.height = height + "px";
		context.canvas.height = height * window.devicePixelRatio;
		context.canvas.width = width * window.devicePixelRatio;
		context.scale(window.devicePixelRatio, window.devicePixelRatio);
	}

	this.PolarArea = function(data,options){
	
		chart.PolarArea.defaults = {
			scaleOverlay : true,
			scaleOverride : false,
			scaleSteps : null,
			scaleStepWidth : null,
			scaleStartValue : null,
			scaleShowLine : true,
			scaleLineColor : "rgba(0,0,0,.1)",
			scaleLineWidth : 1,
			scaleShowLabels : true,
			scaleLabel : "<%=value%>",
			scaleFontFamily : "'Arial'",
			scaleFontSize : 12,
			scaleFontStyle : "normal",
			scaleFontColor : "#666",
			scaleShowLabelBackdrop : true,
			scaleBackdropColor : "rgba(255,255,255,0.75)",
			scaleBackdropPaddingY : 2,
			scaleBackdropPaddingX : 2,
			segmentShowStroke : true,
			segmentStrokeColor : "#fff",
			segmentStrokeWidth : 2,
			animation : true,
			animationSteps : 100,
			animationEasing : "easeOutBounce",
			animateRotate : true,
			animateScale : false,
			onAnimationComplete : null,
			showTooltips : true
		};
		
		var config = (options)? mergeChartConfig(chart.PolarArea.defaults,options) : chart.PolarArea.defaults;
		
		return new PolarArea(data,config,context);
	};

	this.Radar = function(data,options){
	
		chart.Radar.defaults = {
			scaleOverlay : false,
			scaleOverride : false,
			scaleSteps : null,
			scaleStepWidth : null,
			scaleStartValue : null,
			scaleShowLine : true,
			scaleLineColor : "rgba(0,0,0,.1)",
			scaleLineWidth : 1,
			scaleShowLabels : false,
			scaleLabel : "<%=value%>",
			scaleFontFamily : "'Arial'",
			scaleFontSize : 12,
			scaleFontStyle : "normal",
			scaleFontColor : "#666",
			scaleShowLabelBackdrop : true,
			scaleBackdropColor : "rgba(255,255,255,0.75)",
			scaleBackdropPaddingY : 2,
			scaleBackdropPaddingX : 2,
			angleShowLineOut : true,
			angleLineColor : "rgba(0,0,0,.1)",
			angleLineWidth : 1,			
			pointLabelFontFamily : "'Arial'",
			pointLabelFontStyle : "normal",
			pointLabelFontSize : 12,
			pointLabelFontColor : "#666",
			pointDot : true,
			pointDotRadius : 3,
			pointDotStrokeWidth : 1,
			datasetStroke : true,
			datasetStrokeWidth : 2,
			datasetFill : true,
			animation : true,
			animationSteps : 60,
			animationEasing : "easeOutQuart",
			onAnimationComplete : null,
			showTooltips : true
		};
		
		var config = (options)? mergeChartConfig(chart.Radar.defaults,options) : chart.Radar.defaults;

		return new Radar(data,config,context);
	};
	
	this.Pie = function(data,options){
		chart.Pie.defaults = {
			segmentShowStroke : true,
			segmentStrokeColor : "#fff",
			segmentStrokeWidth : 2,
			animation : true,
			animationSteps : 100,
			animationEasing : "easeOutBounce",
			animateRotate : true,
			animateScale : false,
			onAnimationComplete : null,
			labelFontFamily : "'Arial'",
			labelFontStyle : "normal",
			labelFontSize : 12,
			labelFontColor : "#666",
			labelAlign : 'right',
			showTooltips : true
		};		

		var config = (options)? mergeChartConfig(chart.Pie.defaults,options) : chart.Pie.defaults;
		
		return new Pie(data,config,context);				
	};
	
	this.Doughnut = function(data,options){
	
		chart.Doughnut.defaults = {
			segmentShowStroke : true,
			segmentStrokeColor : "#fff",
			segmentStrokeWidth : 2,
			percentageInnerCutout : 50,
			animation : true,
			animationSteps : 100,
			animationEasing : "easeOutBounce",
			animateRotate : true,
			animateScale : false,
			onAnimationComplete : null,
			showTooltips : true
		};		

		var config = (options)? mergeChartConfig(chart.Doughnut.defaults,options) : chart.Doughnut.defaults;
		
		return new Doughnut(data,config,context);			
		
	};

	this.Line = function(data,options){
	
		chart.Line.defaults = {
			scaleOverlay : false,
			scaleOverride : false,
			scaleSteps : null,
			scaleStepWidth : null,
			scaleStartValue : null,
			scaleLineColor : "rgba(0,0,0,.1)",
			scaleLineWidth : 1,
			scaleShowLabels : true,
			scaleLabel : "<%=value%>",
			scaleFontFamily : "'Arial'",
			scaleFontSize : 12,
			scaleFontStyle : "normal",
			scaleFontColor : "#666",
			scaleShowGridLines : true,
			scaleGridLineColor : "rgba(0,0,0,.05)",
			scaleGridLineWidth : 1,
			bezierCurve : true,
			pointDot : true,
			pointDotRadius : 4,
			pointDotStrokeWidth : 2,
			datasetStroke : true,
			datasetStrokeWidth : 2,
			datasetFill : true,
			animation : true,
			animationSteps : 60,
			animationEasing : "easeOutQuart",
			onAnimationComplete : null,
			showTooltips : true
		};		
		var config = (options) ? mergeChartConfig(chart.Line.defaults,options) : chart.Line.defaults;
		
		return new Line(data,config,context);
	}
	
	this.Bar = function(data,options){
		chart.Bar.defaults = {
			scaleOverlay : false,
			scaleOverride : false,
			scaleSteps : null,
			scaleStepWidth : null,
			scaleStartValue : null,
			scaleLineColor : "rgba(0,0,0,.1)",
			scaleLineWidth : 1,
			scaleShowLabels : true,
			scaleLabel : "<%=value%>",
			scaleFontFamily : "'Arial'",
			scaleFontSize : 12,
			scaleFontStyle : "normal",
			scaleFontColor : "#666",
			scaleShowGridLines : true,
			scaleGridLineColor : "rgba(0,0,0,.05)",
			scaleGridLineWidth : 1,
			barShowStroke : true,
			barStrokeWidth : 2,
			barValueSpacing : 5,
			barDatasetSpacing : 1,
			animation : true,
			animationSteps : 60,
			animationEasing : "easeOutQuart",
			onAnimationComplete : null,
			showTooltips : true
		};		
		var config = (options) ? mergeChartConfig(chart.Bar.defaults,options) : chart.Bar.defaults;
		
		return new Bar(data,config,context);		
	}
	
	var clear = function(c){
		c.clearRect(0, 0, width, height);
	};

	var PolarArea = function(data,config,ctx){
		var maxSize, scaleHop, calculatedScale, labelHeight, scaleHeight, valueBounds, labelTemplateString;		
		
		
		calculateDrawingSizes();
		
		valueBounds = getValueBounds();

		labelTemplateString = (config.scaleShowLabels)? config.scaleLabel : null;

		//Check and set the scale
		if (!config.scaleOverride){
			
			calculatedScale = calculateScale(scaleHeight,valueBounds.maxSteps,valueBounds.minSteps,valueBounds.maxValue,valueBounds.minValue,labelTemplateString);
		}
		else {
			calculatedScale = {
				steps : config.scaleSteps,
				stepValue : config.scaleStepWidth,
				graphMin : config.scaleStartValue,
				labels : []
			}
			populateLabels(labelTemplateString, calculatedScale.labels,calculatedScale.steps,config.scaleStartValue,config.scaleStepWidth);
		}
		
		scaleHop = maxSize/(calculatedScale.steps);

		//Wrap in an animation loop wrapper
		animationLoop(config,drawScale,drawAllSegments,ctx);

		function calculateDrawingSizes(){
			maxSize = (Min([width,height])/2);
			//Remove whatever is larger - the font size or line width.
			
			maxSize -= Max([config.scaleFontSize*0.5,config.scaleLineWidth*0.5]);
			
			labelHeight = config.scaleFontSize*2;
			//If we're drawing the backdrop - add the Y padding to the label height and remove from drawing region.
			if (config.scaleShowLabelBackdrop){
				labelHeight += (2 * config.scaleBackdropPaddingY);
				maxSize -= config.scaleBackdropPaddingY*1.5;
			}
			
			scaleHeight = maxSize;
			//If the label height is less than 5, set it to 5 so we don't have lines on top of each other.
			labelHeight = Default(labelHeight,5);
		}
		function drawScale(){
			for (var i=0; i<calculatedScale.steps; i++){
				//If the line object is there
				if (config.scaleShowLine){
					ctx.beginPath();
					ctx.arc(width/2, height/2, scaleHop * (i + 1), 0, (Math.PI * 2), true);
					ctx.strokeStyle = config.scaleLineColor;
					ctx.lineWidth = config.scaleLineWidth;
					ctx.stroke();
				}

				if (config.scaleShowLabels){
					ctx.textAlign = "center";
					ctx.font = config.scaleFontStyle + " " + config.scaleFontSize + "px " + config.scaleFontFamily;
					 var label =  calculatedScale.labels[i];
					//If the backdrop object is within the font object
					if (config.scaleShowLabelBackdrop){
						var textWidth = ctx.measureText(label).width;
						ctx.fillStyle = config.scaleBackdropColor;
						ctx.beginPath();
						ctx.rect(
							Math.round(width/2 - textWidth/2 - config.scaleBackdropPaddingX),	 //X
							Math.round(height/2 - (scaleHop * (i + 1)) - config.scaleFontSize*0.5 - config.scaleBackdropPaddingY),//Y
							Math.round(textWidth + (config.scaleBackdropPaddingX*2)), //Width
							Math.round(config.scaleFontSize + (config.scaleBackdropPaddingY*2)) //Height
						);
						ctx.fill();
					}
					ctx.textBaseline = "middle";
					ctx.fillStyle = config.scaleFontColor;
					ctx.fillText(label,width/2,height/2 - (scaleHop * (i + 1)));
				}
			}
		}
		function drawAllSegments(animationDecimal){
			var startAngle = -Math.PI/2,
			angleStep = (Math.PI*2)/data.length,
			scaleAnimation = 1,
			rotateAnimation = 1;
			if (config.animation) {
				if (config.animateScale) {
					scaleAnimation = animationDecimal;
				}
				if (config.animateRotate){
					rotateAnimation = animationDecimal;
				}
			}

			for (var i=0; i<data.length; i++){

				ctx.beginPath();
				ctx.arc(width/2,height/2,scaleAnimation * calculateOffset(data[i].value,calculatedScale,scaleHop),startAngle, startAngle + rotateAnimation*angleStep, false);
				ctx.lineTo(width/2,height/2);
				ctx.closePath();
				ctx.fillStyle = data[i].color;
				ctx.fill();

				if(animationDecimal >= 1 && config.showTooltips) {
					var points = [{x:width/2,y:height/2}],
						pAmount = 50,
						radius = calculateOffset(data[i].value,calculatedScale,scaleHop);
					points.push({x:width/2+radius*Math.cos(startAngle),y:height/2+radius*Math.sin(startAngle)});
					for(var p = 0; p <= pAmount; p++) {
						points.push({x:width/2+radius*Math.cos(startAngle+p/pAmount*rotateAnimation*angleStep),y:height/2+radius*Math.sin(startAngle+p/pAmount*rotateAnimation*angleStep)});
					}
					registerTooltip(ctx,{type:'shape',points:points},{label:data[i].label,value:data[i].value},'PolarArea');
				}

				if(config.segmentShowStroke){
					ctx.strokeStyle = config.segmentStrokeColor;
					ctx.lineWidth = config.segmentStrokeWidth;
					ctx.stroke();
				}
				startAngle += rotateAnimation*angleStep;
			}
		}
		function getValueBounds() {
			var upperValue = Number.MIN_VALUE;
			var lowerValue = Number.MAX_VALUE;
			for (var i=0; i<data.length; i++){
				if (data[i].value > upperValue) {upperValue = data[i].value;}
				if (data[i].value < lowerValue) {lowerValue = data[i].value;}
			};

			var maxSteps = Math.floor((scaleHeight / (labelHeight*0.66)));
			var minSteps = Math.floor((scaleHeight / labelHeight*0.5));
			
			return {
				maxValue : upperValue,
				minValue : lowerValue,
				maxSteps : maxSteps,
				minSteps : minSteps
			};
			

		}
	}

	var Radar = function (data,config,ctx) {
		var maxSize, scaleHop, calculatedScale, labelHeight, scaleHeight, valueBounds, labelTemplateString;	
			
		//If no labels are defined set to an empty array, so referencing length for looping doesn't blow up.
		if (!data.labels) data.labels = [];
		
		calculateDrawingSizes();

		var valueBounds = getValueBounds();

		labelTemplateString = (config.scaleShowLabels)? config.scaleLabel : null;

		//Check and set the scale
		if (!config.scaleOverride){
			
			calculatedScale = calculateScale(scaleHeight,valueBounds.maxSteps,valueBounds.minSteps,valueBounds.maxValue,valueBounds.minValue,labelTemplateString);
		}
		else {
			calculatedScale = {
				steps : config.scaleSteps,
				stepValue : config.scaleStepWidth,
				graphMin : config.scaleStartValue,
				labels : []
			}
			populateLabels(labelTemplateString, calculatedScale.labels,calculatedScale.steps,config.scaleStartValue,config.scaleStepWidth);
		}
		
		scaleHop = maxSize/(calculatedScale.steps);
		
		animationLoop(config,drawScale,drawAllDataPoints,ctx);
		
		//Radar specific functions.
		function drawAllDataPoints(animationDecimal){
			var rotationDegree = (2*Math.PI)/data.datasets[0].data.length;

			ctx.save();
			//translate to the centre of the canvas.
			ctx.translate(width/2,height/2);
			//We accept multiple data sets for radar charts, so show loop through each set
			for (var i=0; i<data.datasets.length; i++){
				var offset = calculateOffset(data.datasets[i].data[0],calculatedScale,scaleHop);
				ctx.beginPath();
				ctx.moveTo(0,animationDecimal*(-1*offset));
				if(animationDecimal >= 1 && config.showTooltips) {
					var curX = width/2+offset*Math.cos(0-Math.PI/2),
						curY = height/2+offset*Math.sin(0-Math.PI/2),
						pointRadius = config.pointDot ? config.pointDotRadius+config.pointDotStrokeWidth : 10,
						ttData = data.labels[0].trim() != "" ? data.labels[0]+": "+data.datasets[i].data[0] : data.datasets[i].data[0];
					registerTooltip(ctx,{type:'circle',x:curX,y:curY,r:pointRadius},{label:data.labels[0],value:data.datasets[i].data[0]},'Radar');
				}
				for (var j=1; j<data.datasets[i].data.length; j++){
					offset = calculateOffset(data.datasets[i].data[j],calculatedScale,scaleHop);
					ctx.rotate(rotationDegree);
					ctx.lineTo(0,animationDecimal*(-1*offset));
					if(animationDecimal >= 1 && config.showTooltips) {
						var curX = width/2+offset*Math.cos(j*rotationDegree-Math.PI/2),
							curY = height/2+offset*Math.sin(j*rotationDegree-Math.PI/2),
							pointRadius = config.pointDot ? config.pointDotRadius+config.pointDotStrokeWidth : 10,
							ttData = data.labels[j].trim() != "" ? data.labels[j]+": "+data.datasets[i].data[j] : data.datasets[i].data[j];
						registerTooltip(ctx,{type:'circle',x:curX,y:curY,r:pointRadius},{label:data.labels[j],value:data.datasets[i].data[j]},'Radar');
					}
				}
				ctx.closePath();
				
				
				ctx.fillStyle = data.datasets[i].fillColor;
				ctx.strokeStyle = data.datasets[i].strokeColor;
				ctx.lineWidth = config.datasetStrokeWidth;
				ctx.fill();
				ctx.stroke();
				
								
				if (config.pointDot){
					ctx.fillStyle = data.datasets[i].pointColor;
					ctx.strokeStyle = data.datasets[i].pointStrokeColor;
					ctx.lineWidth = config.pointDotStrokeWidth;
					for (var k=0; k<data.datasets[i].data.length; k++){
						ctx.rotate(rotationDegree);
						ctx.beginPath();
						ctx.arc(0,animationDecimal*(-1*calculateOffset(data.datasets[i].data[k],calculatedScale,scaleHop)),config.pointDotRadius,2*Math.PI,false);
						ctx.fill();
						ctx.stroke();
					}					
					
				}
				ctx.rotate(rotationDegree);
			}
			ctx.restore();
			
			
		}
		function drawScale(){
			var rotationDegree = (2*Math.PI)/data.datasets[0].data.length;
			ctx.save();
			ctx.translate(width / 2, height / 2);	
			
			if (config.angleShowLineOut){
				ctx.strokeStyle = config.angleLineColor;					
				ctx.lineWidth = config.angleLineWidth;
				for (var h=0; h<data.datasets[0].data.length; h++){
					
					ctx.rotate(rotationDegree);
					ctx.beginPath();
					ctx.moveTo(0,0);
					ctx.lineTo(0,-maxSize);
					ctx.stroke();
				}
			}

			for (var i=0; i<calculatedScale.steps; i++){
				ctx.beginPath();
				
				if(config.scaleShowLine){
					ctx.strokeStyle = config.scaleLineColor;
					ctx.lineWidth = config.scaleLineWidth;
					ctx.moveTo(0,-scaleHop * (i+1));					
					for (var j=0; j<data.datasets[0].data.length; j++){
						ctx.rotate(rotationDegree);
						ctx.lineTo(0,-scaleHop * (i+1));
					}
					ctx.closePath();
					ctx.stroke();			
							
				}
				
				if (config.scaleShowLabels){				
					ctx.textAlign = 'center';
					ctx.font = config.scaleFontStyle + " " + config.scaleFontSize+"px " + config.scaleFontFamily; 
					ctx.textBaseline = "middle";
					
					if (config.scaleShowLabelBackdrop){
						var textWidth = ctx.measureText(calculatedScale.labels[i]).width;
						ctx.fillStyle = config.scaleBackdropColor;
						ctx.beginPath();
						ctx.rect(
							Math.round(- textWidth/2 - config.scaleBackdropPaddingX),	 //X
							Math.round((-scaleHop * (i + 1)) - config.scaleFontSize*0.5 - config.scaleBackdropPaddingY),//Y
							Math.round(textWidth + (config.scaleBackdropPaddingX*2)), //Width
							Math.round(config.scaleFontSize + (config.scaleBackdropPaddingY*2)) //Height
						);
						ctx.fill();
					}						
					ctx.fillStyle = config.scaleFontColor;
					ctx.fillText(calculatedScale.labels[i],0,-scaleHop*(i+1));
				}

			}
			for (var k=0; k<data.labels.length; k++){				
			ctx.font = config.pointLabelFontStyle + " " + config.pointLabelFontSize+"px " + config.pointLabelFontFamily;
			ctx.fillStyle = config.pointLabelFontColor;
				var opposite = Math.sin(rotationDegree*k) * (maxSize + config.pointLabelFontSize);
				var adjacent = Math.cos(rotationDegree*k) * (maxSize + config.pointLabelFontSize);
				
				if(rotationDegree*k == Math.PI || rotationDegree*k == 0){
					ctx.textAlign = "center";
				}
				else if(rotationDegree*k > Math.PI){
					ctx.textAlign = "right";
				}
				else{
					ctx.textAlign = "left";
				}
				
				ctx.textBaseline = "middle";
				
				ctx.fillText(data.labels[k],opposite,-adjacent);
				
			}
			ctx.restore();
		};
		function calculateDrawingSizes(){
			maxSize = (Min([width,height])/2);

			labelHeight = config.scaleFontSize*2;
			
			var labelLength = 0;
			for (var i=0; i<data.labels.length; i++){
				ctx.font = config.pointLabelFontStyle + " " + config.pointLabelFontSize+"px " + config.pointLabelFontFamily;
				var textMeasurement = ctx.measureText(data.labels[i]).width;
				if(textMeasurement>labelLength) labelLength = textMeasurement;
			}
			
			//Figure out whats the largest - the height of the text or the width of what's there, and minus it from the maximum usable size.
			maxSize -= Max([labelLength,((config.pointLabelFontSize/2)*1.5)]);				
			
			maxSize -= config.pointLabelFontSize;
			maxSize = CapValue(maxSize, null, 0);
			scaleHeight = maxSize;
			//If the label height is less than 5, set it to 5 so we don't have lines on top of each other.
			labelHeight = Default(labelHeight,5);
		};
		function getValueBounds() {
			var upperValue = Number.MIN_VALUE;
			var lowerValue = Number.MAX_VALUE;
			
			for (var i=0; i<data.datasets.length; i++){
				for (var j=0; j<data.datasets[i].data.length; j++){
					if (data.datasets[i].data[j] > upperValue){upperValue = data.datasets[i].data[j]}
					if (data.datasets[i].data[j] < lowerValue){lowerValue = data.datasets[i].data[j]}
				}
			}

			var maxSteps = Math.floor((scaleHeight / (labelHeight*0.66)));
			var minSteps = Math.floor((scaleHeight / labelHeight*0.5));
			
			return {
				maxValue : upperValue,
				minValue : lowerValue,
				maxSteps : maxSteps,
				minSteps : minSteps
			};
			

		}
	}

	var Pie = function(data,config,ctx){
		var segmentTotal = 0;
		
		//In case we have a canvas that is not a square. Minus 5 pixels as padding round the edge.
		var pieRadius = Min([height/2,width/2]) - 5;
		
		for (var i=0; i<data.length; i++){
			segmentTotal += data[i].value;
		}
		ctx.fillStyle = 'black';
		ctx.textBaseline = 'base';
		
		animationLoop(config,null,drawPieSegments,ctx);
				
		function drawPieSegments (animationDecimal){
			var cumulativeAngle = -Math.PI/2,
			scaleAnimation = 1,
			rotateAnimation = 1;
			if (config.animation) {
				if (config.animateScale) {
					scaleAnimation = animationDecimal;
				}
				if (config.animateRotate){
					rotateAnimation = animationDecimal;
				}
			}

			for (var i=0; i<data.length; i++){
				var segmentAngle = rotateAnimation * ((data[i].value/segmentTotal) * (Math.PI*2));
				ctx.beginPath();
				ctx.arc(width/2,height/2,scaleAnimation * pieRadius,cumulativeAngle,cumulativeAngle + segmentAngle);
				ctx.lineTo(width/2,height/2);
				ctx.closePath();
				ctx.fillStyle = data[i].color;
				ctx.fill();

				if(data[i].label && scaleAnimation*pieRadius*2*segmentAngle/(2*Math.PI) > config.labelFontSize) {
					function getPieLabelX(align, r) {
						switch(align) {
							case 'left':
								return -r+20;
								break;
							case 'center':
								return -r/2;
								break;
						}
						return -10;
					}
					
					function reversePieLabelAlign(align) {
						switch(align) {
							case 'left': return 'right'; break;
							case 'right': return 'left'; break;
							case 'center': return align; break;
						}
					}
					
					var fontSize = data[i].labelFontSize || config.labelFontSize+'px';
					
					if(fontSize.match(/^[0-9]+$/g) != null) {
						fontSize = fontSize+'px';
					}
					ctx.font = config.labelFontStyle+ " " +fontSize+" " + config.labelFontFamily;
					ctx.fillStyle = getFadeColor(animationDecimal, data[i].labelColor || 'black', data[i].color);
					ctx.textBaseline = 'middle';
					// rotate text, so it perfectly fits in segments
					var textRotation = -(cumulativeAngle + segmentAngle)+segmentAngle/2,
						tX = width/2+scaleAnimation*pieRadius*Math.cos(textRotation),
						tY = height/2-scaleAnimation*pieRadius*Math.sin(textRotation);
					ctx.textAlign = data[i].labelAlign || config.labelAlign;
					textX = getPieLabelX(ctx.textAlign, scaleAnimation*pieRadius);
					if(textRotation < -Math.PI/2) {
						textRotation -= Math.PI;
						ctx.textAlign = reversePieLabelAlign(ctx.textAlign);
						textX = -textX;
					}
					ctx.translate(tX, tY);
					ctx.rotate(-textRotation);
					ctx.fillText(data[i].label, textX, 0);
					ctx.rotate(textRotation);
					ctx.translate(-tX, -tY);
				}
				
				if(animationDecimal >= 1 && config.showTooltips) {
					var points = [{x:width/2,y:height/2}],
						pAmount = 50;
					points.push({x:width/2+pieRadius*Math.cos(cumulativeAngle),y:height/2+pieRadius*Math.sin(cumulativeAngle)});
					for(var p = 0; p <= pAmount; p++) {
						points.push({x:width/2+pieRadius*Math.cos(cumulativeAngle+p/pAmount*segmentAngle),y:height/2+pieRadius*Math.sin(cumulativeAngle+p/pAmount*segmentAngle)});
					}
					registerTooltip(ctx,{type:'shape',points:points},{label:data[i].label,value:data[i].value},'Pie');
				}
				
				if(config.segmentShowStroke){
					ctx.lineWidth = config.segmentStrokeWidth;
					ctx.strokeStyle = config.segmentStrokeColor;
					ctx.stroke();
				}
				cumulativeAngle += segmentAngle;
			}			
		}		
	}

	var Doughnut = function(data,config,ctx){
		var segmentTotal = 0;
		
		//In case we have a canvas that is not a square. Minus 5 pixels as padding round the edge.
		var doughnutRadius = Min([height/2,width/2]) - 5;
		
		var cutoutRadius = doughnutRadius * (config.percentageInnerCutout/100);
		
		for (var i=0; i<data.length; i++){
			segmentTotal += data[i].value;
		}
		
		
		animationLoop(config,null,drawPieSegments,ctx);
		
		
		function drawPieSegments (animationDecimal){
			var cumulativeAngle = -Math.PI/2,
			scaleAnimation = 1,
			rotateAnimation = 1;
			if (config.animation) {
				if (config.animateScale) {
					scaleAnimation = animationDecimal;
				}
				if (config.animateRotate){
					rotateAnimation = animationDecimal;
				}
			}
			for (var i=0; i<data.length; i++){
				var segmentAngle = rotateAnimation * ((data[i].value/segmentTotal) * (Math.PI*2));
				ctx.beginPath();
				ctx.arc(width/2,height/2,scaleAnimation * doughnutRadius,cumulativeAngle,cumulativeAngle + segmentAngle,false);
				ctx.arc(width/2,height/2,scaleAnimation * cutoutRadius,cumulativeAngle + segmentAngle,cumulativeAngle,true);
				ctx.closePath();
				ctx.fillStyle = data[i].color;
				ctx.fill();

				if(animationDecimal >= 1 && config.showTooltips) {
					var points = [],
						pAmount = 50;
					points.push({x:width/2+doughnutRadius*Math.cos(cumulativeAngle),y:height/2+doughnutRadius*Math.sin(cumulativeAngle)});
					for(var p = 0; p <= pAmount; p++) {
						points.push({x:width/2+doughnutRadius*Math.cos(cumulativeAngle+p/pAmount*segmentAngle),y:height/2+doughnutRadius*Math.sin(cumulativeAngle+p/pAmount*segmentAngle)});
					}
					points.push({x:width/2+cutoutRadius*Math.cos(cumulativeAngle+segmentAngle),y:height/2+cutoutRadius*Math.sin(cumulativeAngle+segmentAngle)});
					for(var p = pAmount; p >= 0; p--) {
						points.push({x:width/2+cutoutRadius*Math.cos(cumulativeAngle+p/pAmount*segmentAngle),y:height/2+cutoutRadius*Math.sin(cumulativeAngle+p/pAmount*segmentAngle)});
					}
					registerTooltip(ctx,{type:'shape',points:points},{label:data[i].label,value:data[i].value},'Doughnut');
				}
				
				if(config.segmentShowStroke){
					ctx.lineWidth = config.segmentStrokeWidth;
					ctx.strokeStyle = config.segmentStrokeColor;
					ctx.stroke();
				}
				cumulativeAngle += segmentAngle;
			}			
		}			
		
		
		
	}

	var Line = function(data,config,ctx){
		var maxSize, scaleHop, calculatedScale, labelHeight, scaleHeight, valueBounds, labelTemplateString, valueHop,widestXLabel, xAxisLength,yAxisPosX,xAxisPosY, rotateLabels = 0;
			
		calculateDrawingSizes();
		
		valueBounds = getValueBounds();
		//Check and set the scale
		labelTemplateString = (config.scaleShowLabels)? config.scaleLabel : "";
		if (!config.scaleOverride){
			
			calculatedScale = calculateScale(scaleHeight,valueBounds.maxSteps,valueBounds.minSteps,valueBounds.maxValue,valueBounds.minValue,labelTemplateString);
		}
		else {
			calculatedScale = {
				steps : config.scaleSteps,
				stepValue : config.scaleStepWidth,
				graphMin : config.scaleStartValue,
				labels : []
			}
			populateLabels(labelTemplateString, calculatedScale.labels,calculatedScale.steps,config.scaleStartValue,config.scaleStepWidth);
		}
		
		scaleHop = Math.floor(scaleHeight/calculatedScale.steps);
		calculateXAxisSize();
		animationLoop(config,drawScale,drawLines,ctx);
		
		function drawLines(animPc){
			for (var i=0; i<data.datasets.length; i++){
				ctx.strokeStyle = data.datasets[i].strokeColor;
				ctx.lineWidth = config.datasetStrokeWidth;
				ctx.beginPath();
				ctx.moveTo(yAxisPosX, xAxisPosY - animPc*(calculateOffset(data.datasets[i].data[0],calculatedScale,scaleHop)))

				for (var j=1; j<data.datasets[i].data.length; j++){
					if (config.bezierCurve){
						ctx.bezierCurveTo(xPos(j-0.5),yPos(i,j-1),xPos(j-0.5),yPos(i,j),xPos(j),yPos(i,j));
					}
					else{
						ctx.lineTo(xPos(j),yPos(i,j));
					}
				}
				var pointRadius = config.pointDot ? config.pointDotRadius+config.pointDotStrokeWidth : 10;
				for(var j = 0; j < data.datasets[i].data.length; j++) {
					if(animPc >= 1 && config.showTooltips) {
						// register tooltips
						registerTooltip(ctx,{type:'circle',x:xPos(j),y:yPos(i,j),r:pointRadius},{label:data.labels[j],value:data.datasets[i].data[j]},'Line');
					}
				}
				ctx.stroke();
				if (config.datasetFill){
					ctx.lineTo(yAxisPosX + (valueHop*(data.datasets[i].data.length-1)),xAxisPosY);
					ctx.lineTo(yAxisPosX,xAxisPosY);
					ctx.closePath();
					ctx.fillStyle = data.datasets[i].fillColor;
					ctx.fill();
				}
				else{
					ctx.closePath();
				}
				if(config.pointDot){
					ctx.fillStyle = data.datasets[i].pointColor;
					ctx.strokeStyle = data.datasets[i].pointStrokeColor;
					ctx.lineWidth = config.pointDotStrokeWidth;
					for (var k=0; k<data.datasets[i].data.length; k++){
						ctx.beginPath();
						ctx.arc(yAxisPosX + (valueHop *k),xAxisPosY - animPc*(calculateOffset(data.datasets[i].data[k],calculatedScale,scaleHop)),config.pointDotRadius,0,Math.PI*2,true);
						ctx.fill();
						ctx.stroke();
					}
				}
			}
			
			function yPos(dataSet,iteration){
				return xAxisPosY - animPc*(calculateOffset(data.datasets[dataSet].data[iteration],calculatedScale,scaleHop));			
			}
			function xPos(iteration){
				return yAxisPosX + (valueHop * iteration);
			}
		}
		function drawScale(){
			//X axis line
			ctx.lineWidth = config.scaleLineWidth;
			ctx.strokeStyle = config.scaleLineColor;
			ctx.beginPath();
			ctx.moveTo(width-widestXLabel/2+5,xAxisPosY);
			ctx.lineTo(width-(widestXLabel/2)-xAxisLength-5,xAxisPosY);
			ctx.stroke();
			
			
			if (rotateLabels > 0){
				ctx.save();
				ctx.textAlign = "right";
			}
			else{
				ctx.textAlign = "center";
			}
			ctx.fillStyle = config.scaleFontColor;
			for (var i=0; i<data.labels.length; i++){
				ctx.save();
				if (rotateLabels > 0){
					ctx.translate(yAxisPosX + i*valueHop,xAxisPosY + config.scaleFontSize);
					ctx.rotate(-(rotateLabels * (Math.PI/180)));
					ctx.fillText(data.labels[i], 0,0);
					ctx.restore();
				}
				
				else{
					ctx.fillText(data.labels[i], yAxisPosX + i*valueHop,xAxisPosY + config.scaleFontSize+3);					
				}

				ctx.beginPath();
				ctx.moveTo(yAxisPosX + i * valueHop, xAxisPosY+3);
				
				//Check i isnt 0, so we dont go over the Y axis twice.
				if(config.scaleShowGridLines && i>0){
					ctx.lineWidth = config.scaleGridLineWidth;
					ctx.strokeStyle = config.scaleGridLineColor;					
					ctx.lineTo(yAxisPosX + i * valueHop, 5);
				}
				else{
					ctx.lineTo(yAxisPosX + i * valueHop, xAxisPosY+3);				
				}
				ctx.stroke();
			}
			
			//Y axis
			ctx.lineWidth = config.scaleLineWidth;
			ctx.strokeStyle = config.scaleLineColor;
			ctx.beginPath();
			ctx.moveTo(yAxisPosX,xAxisPosY+5);
			ctx.lineTo(yAxisPosX,5);
			ctx.stroke();
			
			ctx.textAlign = "right";
			ctx.textBaseline = "middle";
			for (var j=0; j<calculatedScale.steps; j++){
				ctx.beginPath();
				ctx.moveTo(yAxisPosX-3,xAxisPosY - ((j+1) * scaleHop));
				if (config.scaleShowGridLines){
					ctx.lineWidth = config.scaleGridLineWidth;
					ctx.strokeStyle = config.scaleGridLineColor;
					ctx.lineTo(yAxisPosX + xAxisLength + 5,xAxisPosY - ((j+1) * scaleHop));					
				}
				else{
					ctx.lineTo(yAxisPosX-0.5,xAxisPosY - ((j+1) * scaleHop));
				}
				
				ctx.stroke();
				
				if (config.scaleShowLabels){
					ctx.fillText(calculatedScale.labels[j],yAxisPosX-8,xAxisPosY - ((j+1) * scaleHop));
				}
			}
			
			
		}
		function calculateXAxisSize(){
			var longestText = 1;
			//if we are showing the labels
			if (config.scaleShowLabels){
				ctx.font = config.scaleFontStyle + " " + config.scaleFontSize+"px " + config.scaleFontFamily;
				for (var i=0; i<calculatedScale.labels.length; i++){
					var measuredText = ctx.measureText(calculatedScale.labels[i]).width;
					longestText = (measuredText > longestText)? measuredText : longestText;
				}
				//Add a little extra padding from the y axis
				longestText +=10;
			}
			xAxisLength = width - longestText - widestXLabel;
			valueHop = Math.floor(xAxisLength/(data.labels.length-1));	
				
			yAxisPosX = width-widestXLabel/2-xAxisLength;
			xAxisPosY = scaleHeight + config.scaleFontSize/2;				
		}		
		function calculateDrawingSizes(){
			maxSize = height;

			//Need to check the X axis first - measure the length of each text metric, and figure out if we need to rotate by 45 degrees.
			ctx.font = config.scaleFontStyle + " " + config.scaleFontSize+"px " + config.scaleFontFamily;
			widestXLabel = 1;
			for (var i=0; i<data.labels.length; i++){
				var textLength = ctx.measureText(data.labels[i]).width;
				//If the text length is longer - make that equal to longest text!
				widestXLabel = (textLength > widestXLabel)? textLength : widestXLabel;
			}
			if (width/data.labels.length < widestXLabel){
				rotateLabels = 45;
				if (width/data.labels.length < Math.cos(rotateLabels) * widestXLabel){
					rotateLabels = 90;
					maxSize -= widestXLabel; 
				}
				else{
					maxSize -= Math.sin(rotateLabels) * widestXLabel;
				}
			}
			else{
				maxSize -= config.scaleFontSize;
			}
			
			//Add a little padding between the x line and the text
			maxSize -= 5;
			
			
			labelHeight = config.scaleFontSize;
			
			maxSize -= labelHeight;
			//Set 5 pixels greater than the font size to allow for a little padding from the X axis.
			
			scaleHeight = maxSize;
			
			//Then get the area above we can safely draw on.
			
		}		
		function getValueBounds() {
			var upperValue = Number.MIN_VALUE;
			var lowerValue = Number.MAX_VALUE;
			for (var i=0; i<data.datasets.length; i++){
				for (var j=0; j<data.datasets[i].data.length; j++){
					if ( data.datasets[i].data[j] > upperValue) { upperValue = data.datasets[i].data[j] };
					if ( data.datasets[i].data[j] < lowerValue) { lowerValue = data.datasets[i].data[j] };
				}
			};
	
			var maxSteps = Math.floor((scaleHeight / (labelHeight*0.66)));
			var minSteps = Math.floor((scaleHeight / labelHeight*0.5));
			
			return {
				maxValue : upperValue,
				minValue : lowerValue,
				maxSteps : maxSteps,
				minSteps : minSteps
			};
			
	
		}

		
	}
	
	var Bar = function(data,config,ctx){
		var maxSize, scaleHop, calculatedScale, labelHeight, scaleHeight, valueBounds, labelTemplateString, valueHop,widestXLabel, xAxisLength,yAxisPosX,xAxisPosY,barWidth, rotateLabels = 0;
			
		calculateDrawingSizes();
		
		valueBounds = getValueBounds();
		//Check and set the scale
		labelTemplateString = (config.scaleShowLabels)? config.scaleLabel : "";
		if (!config.scaleOverride){
			
			calculatedScale = calculateScale(scaleHeight,valueBounds.maxSteps,valueBounds.minSteps,valueBounds.maxValue,valueBounds.minValue,labelTemplateString);
		}
		else {
			calculatedScale = {
				steps : config.scaleSteps,
				stepValue : config.scaleStepWidth,
				graphMin : config.scaleStartValue,
				labels : []
			}
			populateLabels(labelTemplateString, calculatedScale.labels,calculatedScale.steps,config.scaleStartValue,config.scaleStepWidth);
		}
		
		scaleHop = Math.floor(scaleHeight/calculatedScale.steps);
		calculateXAxisSize();
		animationLoop(config,drawScale,drawBars,ctx);		
		
		function drawBars(animPc){
			ctx.lineWidth = config.barStrokeWidth;
			for (var i=0; i<data.datasets.length; i++){
					ctx.fillStyle = data.datasets[i].fillColor;
					ctx.strokeStyle = data.datasets[i].strokeColor;
				for (var j=0; j<data.datasets[i].data.length; j++){
					var barOffset = yAxisPosX + config.barValueSpacing + valueHop*j + barWidth*i + config.barDatasetSpacing*i + config.barStrokeWidth*i;
					
					ctx.beginPath();
					ctx.moveTo(barOffset, xAxisPosY);
					ctx.lineTo(barOffset, xAxisPosY - animPc*calculateOffset(data.datasets[i].data[j],calculatedScale,scaleHop)+(config.barStrokeWidth/2));
					ctx.lineTo(barOffset + barWidth, xAxisPosY - animPc*calculateOffset(data.datasets[i].data[j],calculatedScale,scaleHop)+(config.barStrokeWidth/2));
					ctx.lineTo(barOffset + barWidth, xAxisPosY);
					if(config.barShowStroke){
						ctx.stroke();
					}
					ctx.closePath();
					ctx.fill();

					if(animPc >= 1 && config.showTooltips) {
						// register tooltips
						var x = barOffset,
							height = calculateOffset(data.datasets[i].data[j],calculatedScale,scaleHop),
							y = xAxisPosY-height,
							width = barWidth;
						registerTooltip(ctx,{type:'rect',x:x,y:y,width:width,height:height},{label:data.labels[j],value:data.datasets[i].data[j]},'Bar');
					}
				}
			}
			
		}
		function drawScale(){
			//X axis line
			ctx.lineWidth = config.scaleLineWidth;
			ctx.strokeStyle = config.scaleLineColor;
			ctx.beginPath();
			ctx.moveTo(width-widestXLabel/2+5,xAxisPosY);
			ctx.lineTo(width-(widestXLabel/2)-xAxisLength-5,xAxisPosY);
			ctx.stroke();
			
			
			if (rotateLabels > 0){
				ctx.save();
				ctx.textAlign = "right";
			}
			else{
				ctx.textAlign = "center";
			}
			ctx.fillStyle = config.scaleFontColor;
			for (var i=0; i<data.labels.length; i++){
				ctx.save();
				if (rotateLabels > 0){
					ctx.translate(yAxisPosX + i*valueHop,xAxisPosY + config.scaleFontSize);
					ctx.rotate(-(rotateLabels * (Math.PI/180)));
					ctx.fillText(data.labels[i], 0,0);
					ctx.restore();
				}
				
				else{
					ctx.fillText(data.labels[i], yAxisPosX + i*valueHop + valueHop/2,xAxisPosY + config.scaleFontSize+3);					
				}

				ctx.beginPath();
				ctx.moveTo(yAxisPosX + (i+1) * valueHop, xAxisPosY+3);
				
				//Check i isnt 0, so we dont go over the Y axis twice.
					ctx.lineWidth = config.scaleGridLineWidth;
					ctx.strokeStyle = config.scaleGridLineColor;					
					ctx.lineTo(yAxisPosX + (i+1) * valueHop, 5);
				ctx.stroke();
			}
			
			//Y axis
			ctx.lineWidth = config.scaleLineWidth;
			ctx.strokeStyle = config.scaleLineColor;
			ctx.beginPath();
			ctx.moveTo(yAxisPosX,xAxisPosY+5);
			ctx.lineTo(yAxisPosX,5);
			ctx.stroke();
			
			ctx.textAlign = "right";
			ctx.textBaseline = "middle";
			for (var j=0; j<calculatedScale.steps; j++){
				ctx.beginPath();
				ctx.moveTo(yAxisPosX-3,xAxisPosY - ((j+1) * scaleHop));
				if (config.scaleShowGridLines){
					ctx.lineWidth = config.scaleGridLineWidth;
					ctx.strokeStyle = config.scaleGridLineColor;
					ctx.lineTo(yAxisPosX + xAxisLength + 5,xAxisPosY - ((j+1) * scaleHop));					
				}
				else{
					ctx.lineTo(yAxisPosX-0.5,xAxisPosY - ((j+1) * scaleHop));
				}
				
				ctx.stroke();
				if (config.scaleShowLabels){
					ctx.fillText(calculatedScale.labels[j],yAxisPosX-8,xAxisPosY - ((j+1) * scaleHop));
				}
			}
			
			
		}
		function calculateXAxisSize(){
			var longestText = 1;
			//if we are showing the labels
			if (config.scaleShowLabels){
				ctx.font = config.scaleFontStyle + " " + config.scaleFontSize+"px " + config.scaleFontFamily;
				for (var i=0; i<calculatedScale.labels.length; i++){
					var measuredText = ctx.measureText(calculatedScale.labels[i]).width;
					longestText = (measuredText > longestText)? measuredText : longestText;
				}
				//Add a little extra padding from the y axis
				longestText +=10;
			}
			xAxisLength = width - longestText - widestXLabel;
			valueHop = Math.floor(xAxisLength/(data.labels.length));	
			
			barWidth = (valueHop - config.scaleGridLineWidth*2 - (config.barValueSpacing*2) - (config.barDatasetSpacing*data.datasets.length-1) - ((config.barStrokeWidth/2)*data.datasets.length-1))/data.datasets.length;
			
			yAxisPosX = width-widestXLabel/2-xAxisLength;
			xAxisPosY = scaleHeight + config.scaleFontSize/2;				
		}		
		function calculateDrawingSizes(){
			maxSize = height;

			//Need to check the X axis first - measure the length of each text metric, and figure out if we need to rotate by 45 degrees.
			ctx.font = config.scaleFontStyle + " " + config.scaleFontSize+"px " + config.scaleFontFamily;
			widestXLabel = 1;
			for (var i=0; i<data.labels.length; i++){
				var textLength = ctx.measureText(data.labels[i]).width;
				//If the text length is longer - make that equal to longest text!
				widestXLabel = (textLength > widestXLabel)? textLength : widestXLabel;
			}
			if (width/data.labels.length < widestXLabel){
				rotateLabels = 45;
				if (width/data.labels.length < Math.cos(rotateLabels) * widestXLabel){
					rotateLabels = 90;
					maxSize -= widestXLabel; 
				}
				else{
					maxSize -= Math.sin(rotateLabels) * widestXLabel;
				}
			}
			else{
				maxSize -= config.scaleFontSize;
			}
			
			//Add a little padding between the x line and the text
			maxSize -= 5;
			
			
			labelHeight = config.scaleFontSize;
			
			maxSize -= labelHeight;
			//Set 5 pixels greater than the font size to allow for a little padding from the X axis.
			
			scaleHeight = maxSize;
			
			//Then get the area above we can safely draw on.
			
		}		
		function getValueBounds() {
			var upperValue = Number.MIN_VALUE;
			var lowerValue = Number.MAX_VALUE;
			for (var i=0; i<data.datasets.length; i++){
				for (var j=0; j<data.datasets[i].data.length; j++){
					if ( data.datasets[i].data[j] > upperValue) { upperValue = data.datasets[i].data[j] };
					if ( data.datasets[i].data[j] < lowerValue) { lowerValue = data.datasets[i].data[j] };
				}
			};
	
			var maxSteps = Math.floor((scaleHeight / (labelHeight*0.66)));
			var minSteps = Math.floor((scaleHeight / labelHeight*0.5));
			
			return {
				maxValue : upperValue,
				minValue : lowerValue,
				maxSteps : maxSteps,
				minSteps : minSteps
			};
			
	
		}
	}
	
	function calculateOffset(val,calculatedScale,scaleHop){
		var outerValue = calculatedScale.steps * calculatedScale.stepValue;
		var adjustedValue = val - calculatedScale.graphMin;
		var scalingFactor = CapValue(adjustedValue/outerValue,1,0);
		return (scaleHop*calculatedScale.steps) * scalingFactor;
	}
	
	function animationLoop(config,drawScale,drawData,ctx){
		var animFrameAmount = (config.animation)? 1/CapValue(config.animationSteps,Number.MAX_VALUE,1) : 1,
			easingFunction = animationOptions[config.animationEasing],
			percentAnimComplete =(config.animation)? 0 : 1;
		
	
		
		if (typeof drawScale !== "function") drawScale = function(){};
		
		requestAnimFrame(animLoop);
		
		function animateFrame(){
			var easeAdjustedAnimationPercent =(config.animation)? CapValue(easingFunction(percentAnimComplete),null,0) : 1;
			clear(ctx);
			if(config.scaleOverlay){
				drawData(easeAdjustedAnimationPercent);
				drawScale();
			} else {
				drawScale();
				drawData(easeAdjustedAnimationPercent);
			}				
		}
		function animLoop(){
			//We need to check if the animation is incomplete (less than 1), or complete (1).
				percentAnimComplete += animFrameAmount;
				animateFrame();	
				//Stop the loop continuing forever
				if (percentAnimComplete <= 1){
					requestAnimFrame(animLoop);
				}
				else{
					if (typeof config.onAnimationComplete == "function") config.onAnimationComplete();
				}
			
		}		
		
	}

	//Declare global functions to be called within this namespace here.
	
	
	// shim layer with setTimeout fallback
	var requestAnimFrame = (function(){
		return window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			function(callback) {
				window.setTimeout(callback, 1000 / 60);
			};
	})();

	function calculateScale(drawingHeight,maxSteps,minSteps,maxValue,minValue,labelTemplateString){
		var graphMin,graphMax,graphRange,stepValue,numberOfSteps,valueRange,rangeOrderOfMagnitude,decimalNum;
		valueRange = maxValue - minValue;
		rangeOrderOfMagnitude = calculateOrderOfMagnitude(valueRange);
		graphMin = Math.floor(minValue / (1 * Math.pow(10, rangeOrderOfMagnitude))) * Math.pow(10, rangeOrderOfMagnitude);       
		graphMax = Math.ceil(maxValue / (1 * Math.pow(10, rangeOrderOfMagnitude))) * Math.pow(10, rangeOrderOfMagnitude);
		graphRange = graphMax - graphMin;
		stepValue = Math.pow(10, rangeOrderOfMagnitude);
		numberOfSteps = Math.round(graphRange / stepValue);
	        
		//Compare number of steps to the max and min for that size graph, and add in half steps if need be.	        
		while(numberOfSteps < minSteps || numberOfSteps > maxSteps) {
			if (numberOfSteps < minSteps){
				stepValue /= 2;
				numberOfSteps = Math.round(graphRange/stepValue);
			}
			else{
				stepValue *=2;
				numberOfSteps = Math.round(graphRange/stepValue);
			}
		}

		var labels = [];
		populateLabels(labelTemplateString, labels, numberOfSteps, graphMin, stepValue);

		return {
			steps : numberOfSteps,
			stepValue : stepValue,
			graphMin : graphMin,
			labels : labels				
		}
		
		function calculateOrderOfMagnitude(val){
		  return Math.floor(Math.log(val) / Math.LN10);
		}
	}

	//Populate an array of all the labels by interpolating the string.
	function populateLabels(labelTemplateString, labels, numberOfSteps, graphMin, stepValue) {
		if (labelTemplateString) {
			//Fix floating point errors by setting to fixed the on the same decimal as the stepValue.
			for (var i = 1; i < numberOfSteps + 1; i++) {
				labels.push(tmpl(labelTemplateString, {value: (graphMin + (stepValue * i)).toFixed(getDecimalPlaces(stepValue))}));
			}
		}
	}

    //Populate an array of all the labels by interpolating the string.
    function populateLabels(labelTemplateString, labels, numberOfSteps, graphMin, stepValue) {
        if (labelTemplateString) {
            //Fix floating point errors by setting to fixed the on the same decimal as the stepValue.
            for (var i = 1; i < numberOfSteps + 1; i++) {
                labels.push(tmpl(labelTemplateString, {value: (graphMin + (stepValue * i)).toFixed(getDecimalPlaces(stepValue))}));
            }
        }
    }
	
	//Max value from array
	function Max( array ){
		return Math.max.apply( Math, array );
	};
	//Min value from array
	function Min( array ){
		return Math.min.apply( Math, array );
	};
	//Default if undefined
	function Default(userDeclared,valueIfFalse){
		if(!userDeclared){
			return valueIfFalse;
		} else {
			return userDeclared;
		}
	};
	//Is a number function
	function isNumber(n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	}
	//Apply cap a value at a high or low number
	function CapValue(valueToCap, maxValue, minValue){
		if(isNumber(maxValue)) {
			if( valueToCap > maxValue ) {
				return maxValue;
			}
		}
		if(isNumber(minValue)){
			if ( valueToCap < minValue ){
				return minValue;
			}
		}
		return valueToCap;
	}
	function getDecimalPlaces (num){
		var numberOfDecimalPlaces;
		if (num%1!=0){
			return num.toString().split(".")[1].length
		}
		else{
			return 0;
		}
		
	} 
	
	function mergeChartConfig(defaults,userDefined){
		var returnObj = {};
		for (var attrname in defaults) { returnObj[attrname] = defaults[attrname]; }
		for (var attrname in userDefined) {
			if(typeof(userDefined[attrname]) === "object" && defaults[attrname]) {
				returnObj[attrname] = mergeChartConfig(defaults[attrname], userDefined[attrname]);
			} else {
				returnObj[attrname] = userDefined[attrname];
			}
		}
		return returnObj;
	}
	
	//Javascript micro templating by John Resig - source at http://ejohn.org/blog/javascript-micro-templating/
	  var cache = {};
	 
	  function tmpl(str, data){
		// Figure out if we're getting a template, or if we need to
		// load the template - and be sure to cache the result.
		var fn = !/\W/.test(str) ?
		  cache[str] = cache[str] ||
			tmpl(document.getElementById(str).innerHTML) :
		 
		  // Generate a reusable function that will serve as a template
		  // generator (and which will be cached).
		  new Function("obj",
			"var p=[],print=function(){p.push.apply(p,arguments);};" +
		   
			// Introduce the data as local variables using with(){}
			"with(obj){p.push('" +
		   
			// Convert the template into pure JavaScript
			str
			  .replace(/[\r\t\n]/g, " ")
			  .split("<%").join("\t")
			  .replace(/((^|%>)[^\t]*)'/g, "$1\r")
			  .replace(/\t=(.*?)%>/g, "',$1,'")
			  .split("\t").join("');")
			  .split("%>").join("p.push('")
			  .split("\r").join("\\'")
		  + "');}return p.join('');");
	   
		// Provide some basic currying to the user
		return data ? fn( data ) : fn;
	  };

	function getFadeColor(percent, primColor, secColor) {
		var pseudoEl = document.createElement('div'),
			rgbPrim,
			rgbSec;
		pseudoEl.style.color = primColor;
		document.body.appendChild(pseudoEl);
		rgbPrim = window.getComputedStyle(pseudoEl).color;
		pseudoEl.style.color = secColor;
		rgbSec = window.getComputedStyle(pseudoEl).color;
		var regex = /rgb *\( *([0-9]{1,3}) *, *([0-9]{1,3}) *, *([0-9]{1,3}) *\)/,
			valuesP = regex.exec(rgbPrim),
			valuesS = regex.exec(rgbSec),
			rP = Math.round(parseFloat(valuesP[1])),
			gP = Math.round(parseFloat(valuesP[2])),
			bP = Math.round(parseFloat(valuesP[3])),
			rS = Math.round(parseFloat(valuesS[1])),
			gS = Math.round(parseFloat(valuesS[2])),
			bS = Math.round(parseFloat(valuesS[3])),
			rCur = parseInt((rP-rS)*percent+rS),
			gCur = parseInt((gP-gS)*percent+gS),
			bCur = parseInt((bP-bS)*percent+bS);
		pseudoEl.parentNode.removeChild(pseudoEl);
		return "rgb("+rCur+','+gCur+','+bCur+')';
	}
}

/*!
 * Chart.js
 * http://chartjs.org/
 *
 * Copyright 2013 Nick Downie
 * Released under the MIT license
 * https://github.com/nnnick/Chart.js/blob/master/LICENSE.md
 */


/*!
 * ChartNew.js
 *
 * Vancoppenolle Francois - January 2014
 * francois.vancoppenolle@favomo.be
 *
 * Source location : http:\\www.favomo.be\ChartNew
 * GitHub community : https://github.com/FVANCOP/GraphNew.js
 *
 * This file is an adaptation of the chart.js source developped by Nick Downie (2013)
 * https://github.com/nnnick/Chart.js
 *
 * new charts
 *
 *     horizontalBar
 *     horizontalStackedBar
 *
 * Added items :
 *
 *     Title
 *     Subtitle
 *     X Axis Label
 *     Y Axis Label
 *     Unit Label
 *     Y Axis on the right and/or the left
 *     Annotates
 *     canvas Border
 *     Legend
 *     Footnote
 *     crossText
 *     graphMin / graphMax
 *
 */


///////// FUNCTIONS THAN CAN BE USED IN THE TEMPLATES ///////////////////////////////////////////


function numberWithCommas(x) {
		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function roundTo(num,place) {
		return +(Math.round(num + "e+"+place)  + "e-"+place);
}

function roundToWithThousands(num,place) {
		return numberWithCommas(roundTo(num,place));
}


///////// ANNOTATE PART OF THE SCRIPT ///////////////////////////////////////////

/********************************************************************************
Copyright (C) 1999 Thomas Brattli
This script is made by and copyrighted to Thomas Brattli
Visit for more great scripts. This may be used freely as long as this msg is intact!
I will also appriciate any links you could give me.
Distributed by Hypergurl
********************************************************************************/

		var cachebis = {};

		function tmplbis(str, data){
			// Figure out if we're getting a template, or if we need to
			// load the template - and be sure to cache the result.
			var fn = !/\W/.test(str) ?
				cachebis[str] = cachebis[str] ||
					tmplbis(document.getElementById(str).innerHTML) :

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


cursorDivCreated=false;

function createCursorDiv()
{
	if(cursorDivCreated==false)
	{
		var div = document.createElement('divCursor');
		div.id='divCursor';
		div.style.position='absolute';
		document.body.appendChild(div);
		cursorDivCreated=true;
	}
}


//Default browsercheck, added to all scripts!
function checkBrowser(){
	this.ver=navigator.appVersion
	this.dom=document.getElementById?1:0
	this.ie5=(this.ver.indexOf("MSIE 5")>-1 && this.dom)?1:0;
	this.ie4=(document.all && !this.dom)?1:0;
	this.ns5=(this.dom && parseInt(this.ver) >= 5) ?1:0;
	this.ns4=(document.layers && !this.dom)?1:0;
	this.bw=(this.ie5 || this.ie4 || this.ns4 || this.ns5)
	return this
}
bw=new checkBrowser()

//Set these variables:
fromLeft=10 // How much from the left of the cursor should the div be?
fromTop=10 // How much from the top of the cursor should the div be?

/********************************************************************
Initilizes the objects
*********************************************************************/

function cursorInit(){

	scrolled=bw.ns4 || bw.ns5?"window.pageYOffset":"document.body.scrollTop"
	if(bw.ns4)document.captureEvents(Event.MOUSEMOVE)
}
/********************************************************************
Contructs the cursorobjects
*********************************************************************/
function makeCursorObj(obj,nest){

	createCursorDiv();

	nest=(!nest) ? '':'document.'+nest+'.'
	this.css=bw.dom? document.getElementById(obj).style:bw.ie4?document.all[obj].style:bw.ns4?eval(nest+"document.layers." +obj):0;
	this.moveIt=b_moveIt;

	cursorInit();

	return this
}
function b_moveIt(x,y)
{


	this.x=x;
	this.y=y;
	this.css.left=this.x+"px";
	this.css.top=this.y+"px";
}




function isIE () {
	var myNav = navigator.userAgent.toLowerCase();
	return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
}



if(isIE() <9 && isIE()!= false)
{

	if(typeof String.prototype.trim !== 'function') {
		String.prototype.trim = function() {
			return this.replace(/^\s+|\s+$/g, '');
		}
	}
}

var jsGraphAnnotate=new Array();

function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return {
		 x: evt.clientX - rect.left,
		 y: evt.clientY - rect.top
	};
}

function doMouseMove(ctx,config,event){

		 font="<font face="+config.annotateFontFamily+" size="+config.annotateFontSize+"px style=\"font-style:"+config.annotateFontStyle+";color:"+config.annotateFontColor+"\">";

		 document.getElementById('divCursor').innerHTML="";
		 document.getElementById('divCursor').style.border="";
		 document.getElementById('divCursor').style.backgroundColor ="";

		 canvas_pos=getMousePos(ctx.canvas,event);
		 for(i=0;i<jsGraphAnnotate[ctx.canvas.id]["length"];i++)
		 {
				if(jsGraphAnnotate[ctx.canvas.id][i][0]=="ARC") // Arc
				{
						distance=Math.sqrt((canvas_pos.x-jsGraphAnnotate[ctx.canvas.id][i][1])*(canvas_pos.x-jsGraphAnnotate[ctx.canvas.id][i][1])+(canvas_pos.y-jsGraphAnnotate[ctx.canvas.id][i][2])*(canvas_pos.y-jsGraphAnnotate[ctx.canvas.id][i][2]));
						if(distance > jsGraphAnnotate[ctx.canvas.id][i][3] && distance < jsGraphAnnotate[ctx.canvas.id][i][4]  )
						{

							angle=Math.acos((canvas_pos.x-jsGraphAnnotate[ctx.canvas.id][i][1])/distance);
							if(canvas_pos.y<jsGraphAnnotate[ctx.canvas.id][i][2])angle=-angle;
							if(angle < -Math.PI/2)angle=angle+2*Math.PI;
							if(angle > jsGraphAnnotate[ctx.canvas.id][i][5] && angle < jsGraphAnnotate[ctx.canvas.id][i][6])
							{
								document.getElementById('divCursor').style.border=config.annotateBorder;
								document.getElementById('divCursor').style.backgroundColor =config.annotateBackgroundColor;

								v1=jsGraphAnnotate[ctx.canvas.id][i][7];       // V1=Label
								v2=jsGraphAnnotate[ctx.canvas.id][i][8];       // V2=Data Value
								v3=jsGraphAnnotate[ctx.canvas.id][i][9];       // V3=Cumulated Value
								v4=jsGraphAnnotate[ctx.canvas.id][i][10];      // V4=Total Data Value
								v5=jsGraphAnnotate[ctx.canvas.id][i][11];      // V5=Angle
								v6=100*v2/v4;                                  // v6=Percentage;
								v7=jsGraphAnnotate[ctx.canvas.id][i][1];       // v7=midPointX of arc;
								v8=jsGraphAnnotate[ctx.canvas.id][i][2];       // v8=midPointY of arc;
								v9=jsGraphAnnotate[ctx.canvas.id][i][3];       // v9=radius Minimum;
								v10=jsGraphAnnotate[ctx.canvas.id][i][4];      // v10=radius Maximum;
								v11=jsGraphAnnotate[ctx.canvas.id][i][5];      // v11=start angle;
								v12=jsGraphAnnotate[ctx.canvas.id][i][6];      // v12=stop angle;
								v13=jsGraphAnnotate[ctx.canvas.id][i][7];      // v13=position in Data;


								graphPosX=canvas_pos.x;
								graphPosY=canvas_pos.y;

								dispString=tmplbis(config.annotateLabel,{v1:v1 ,v2:v2, v3:v3,v4:v4, v5:v5, v6:v6, v7:v7, v8:v8, v9:v9, v10:v10, v11:v11, v12:v12, v13:v13, graphPosX:graphPosX, graphPosY:graphPosY});
								document.getElementById('divCursor').innerHTML=font+dispString+"</font>";

								x=bw.ns4 || bw.ns5?event.pageX:event.x ;
								y=bw.ns4 || bw.ns5?event.pageY:event.y ;
								if(bw.ie4 || bw.ie5) y=y+eval(scrolled);
								oCursor.moveIt(x+fromLeft,y+fromTop) ;


							}
						}
				} else if(jsGraphAnnotate[ctx.canvas.id][i][0]=="RECT") {
						if(canvas_pos.x > jsGraphAnnotate[ctx.canvas.id][i][1] && canvas_pos.x < jsGraphAnnotate[ctx.canvas.id][i][3] && canvas_pos.y < jsGraphAnnotate[ctx.canvas.id][i][2] && canvas_pos.y > jsGraphAnnotate[ctx.canvas.id][i][4])
						{
								document.getElementById('divCursor').style.border=config.annotateBorder;
								document.getElementById('divCursor').style.backgroundColor =config.annotateBackgroundColor;

								v1=jsGraphAnnotate[ctx.canvas.id][i][5];       // V1=Label1
								v2=jsGraphAnnotate[ctx.canvas.id][i][6];       // V2=Label2
								v3=jsGraphAnnotate[ctx.canvas.id][i][7];       // V3=Data Value
								v4=jsGraphAnnotate[ctx.canvas.id][i][8];       // V4=Cumulated Value
								v5=jsGraphAnnotate[ctx.canvas.id][i][9] ;      // V5=Total Data Value
								v6=100*v3/v5;                                  // v6=Percentage;
								v7=jsGraphAnnotate[ctx.canvas.id][i][1];       // v7=top X of rectangle;
								v8=jsGraphAnnotate[ctx.canvas.id][i][2];       // v8=top Y of rectangle;
								v9=jsGraphAnnotate[ctx.canvas.id][i][3];       // v9=bottom X of rectangle;
								v10=jsGraphAnnotate[ctx.canvas.id][i][4];      // v10=bottom Y of rectangle;
								v11=jsGraphAnnotate[ctx.canvas.id][i][10];      // v11=position in Dataset;
								v12=jsGraphAnnotate[ctx.canvas.id][i][11];      // v12=position in Dataset[v11].Data;

								graphPosX=canvas_pos.x;
								graphPosY=canvas_pos.y;

								dispString=tmplbis(config.annotateLabel,{v1:v1 ,v2:v2, v3:v3,v4:v4, v5:v5, v6:v6, v7:v7, v8:v8, v9:v9, v10:v10, v11:v11, v12:v12, graphPosX:graphPosX, graphPosY:graphPosY});
								document.getElementById('divCursor').innerHTML=font+dispString+"</font>";



								x=bw.ns4 || bw.ns5?event.pageX:event.x ;
								y=bw.ns4 || bw.ns5?event.pageY:event.y ;
								if(bw.ie4 || bw.ie5) y=y+eval(scrolled);
								oCursor.moveIt(x+fromLeft,y+fromTop) ;


						}

				} else if(jsGraphAnnotate[ctx.canvas.id][i][0]=="POINT") {
						distance=Math.sqrt((canvas_pos.x-jsGraphAnnotate[ctx.canvas.id][i][1])*(canvas_pos.x-jsGraphAnnotate[ctx.canvas.id][i][1])+(canvas_pos.y-jsGraphAnnotate[ctx.canvas.id][i][2])*(canvas_pos.y-jsGraphAnnotate[ctx.canvas.id][i][2]));
						if(distance < 10)
						{
								document.getElementById('divCursor').style.border=config.annotateBorder;
								document.getElementById('divCursor').style.backgroundColor =config.annotateBackgroundColor;

								v1=jsGraphAnnotate[ctx.canvas.id][i][3];       // V1=Label1
								v2=jsGraphAnnotate[ctx.canvas.id][i][4];       // V2=Label2
								v3=jsGraphAnnotate[ctx.canvas.id][i][5];       // V3=Data Value
								v4=jsGraphAnnotate[ctx.canvas.id][i][6];       // V4=Difference with Previous line
								v5=jsGraphAnnotate[ctx.canvas.id][i][7] ;      // V5=Difference with next line;
								v6=jsGraphAnnotate[ctx.canvas.id][i][8] ;      // V6=max;
								v7=jsGraphAnnotate[ctx.canvas.id][i][9] ;      // V7=Total;
								v8=100*v3/v7;                                  // v8=percentage;
								v9=jsGraphAnnotate[ctx.canvas.id][i][1];       // v9=pos X of point;
								v10=jsGraphAnnotate[ctx.canvas.id][i][2];       // v10=pos Y of point;
								v11=jsGraphAnnotate[ctx.canvas.id][i][10];      // v11=position in Dataset;
								v12=jsGraphAnnotate[ctx.canvas.id][i][11];      // v12=position in Dataset[v11].Data;



								graphPosX=canvas_pos.x;
								graphPosY=canvas_pos.y;


								dispString=tmplbis(config.annotateLabel,{v1:v1 ,v2:v2, v3:v3,v4:v4, v5:v5, v6:v6, v7:v7, v8:v8, v9:v9, v10:v10, v11:v11, v12:v12, graphPosX:graphPosX, graphPosY:graphPosY});
								document.getElementById('divCursor').innerHTML=font+dispString+"</font>";


								x=bw.ns4 || bw.ns5?event.pageX:event.x ;
								y=bw.ns4 || bw.ns5?event.pageY:event.y ;
								if(bw.ie4 || bw.ie5) y=y+eval(scrolled);
								oCursor.moveIt(x+fromLeft,y+fromTop) ;

						}

				}
		 }

	}







//Define the global Chart Variable as a class.
window.Chart = function(context){

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

	//Variables global to the chart
	var width = context.canvas.width;
	var height = context.canvas.height;


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
			canvasBorders : false,
			canvasBordersWidth : 3,
			canvasBordersColor : "black",
			graphTitle : "",
			graphTitleFontFamily : "'Arial'",
			graphTitleFontSize : 24,
			graphTitleFontStyle : "bold",
			graphTitleFontColor : "#666",
			graphSubTitle : "",
			graphSubTitleFontFamily : "'Arial'",
			graphSubTitleFontSize : 18,
			graphSubTitleFontStyle : "normal",
			graphSubTitleFontColor : "#666",
			footNote : "",
			footNoteFontFamily : "'Arial'",
			footNoteFontSize : 8,
			footNoteFontStyle : "bold",
			footNoteFontColor : "#666",
			legend : false,
			legendFontFamily : "'Arial'",
			legendFontSize : 12,
			legendFontStyle : "normal",
			legendFontColor : "#666",
			legendBlockSize : 15,
			legendBorders : true,
			legendBordersWidth : 1,
			legendBordersColors : "#666",
			annotateDisplay : false,
			annotateFunction : "mousemove",
			annotateFontFamily : "'Arial'",
			annotateBorder : "thin solid black",
			annotateBackgroundColor : "#66FFCC",
			annotateFontSize : 4,
			annotateFontStyle : "normal",
			annotateFontColor : "#666",
			annotateLabel : "<%=(v1 == ''? '' : v1+':')+ roundToWithThousands(v2,2) + ' (' + roundToWithThousands(v6,1) + ' %)'%>" ,
			crossText : [""],
			crossTextOverlay :   [true],
			crossTextFontFamily : ["'Arial'"],
			crossTextFontSize : [12],
			crossTextFontStyle : ["normal"],
			crossTextFontColor : ["rgba(220,220,220,1)"],
			crossTextRelativePosX : [2],
			crossTextRelativePosY : [2],
			crossTextBaseline: ["middle"],
			crossTextAlign : ["center"],
			crossTextPosX : [0],
			crossTextPosY : [0],
			crossTextAngle : [0],
			crossTextFunction : null,
			spaceTop : 0,
			spaceBottom : 0,
			spaceRight : 0,
			spaceLeft : 0
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
			canvasBorders : false,
			canvasBordersWidth : 3,
			canvasBordersColor : "black",
			graphTitle : "",
			graphTitleFontFamily : "'Arial'",
			graphTitleFontSize : 24,
			graphTitleFontStyle : "bold",
			graphTitleFontColor : "#666",
			graphSubTitle : "",
			graphSubTitleFontFamily : "'Arial'",
			graphSubTitleFontSize : 18,
			graphSubTitleFontStyle : "normal",
			graphSubTitleFontColor : "#666",
			footNote : "",
			footNoteFontFamily : "'Arial'",
			footNoteFontSize : 8,
			footNoteFontStyle : "bold",
			footNoteFontColor : "#666",
			legend : false,
			legendFontFamily : "'Arial'",
			legendFontSize : 12,
			legendFontStyle : "normal",
			legendFontColor : "#666",
			legendBlockSize : 15,
			legendBorders : true,
			legendBordersWidth : 1,
			legendBordersColors : "#666" ,
			annotateDisplay : false,
			annotateFunction : "mousemove",
			annotateFontFamily : "'Arial'",
			annotateBorder : "thin solid black",
			annotateBackgroundColor : "#66FFCC",
			annotateFontSize : 4,
			annotateFontStyle : "normal",
			annotateFontColor : "#666",
			annotateLabel : "<%=(v1 == '' ? '' : v1) + (v1!='' && v2 !='' ? '/' : '')+(v2 == '' ? '' : v2)+(v1!='' || v2 !='' ? ':' : '') + roundToWithThousands(v3,2)%>" ,
			crossText : [""],
			crossTextOverlay :   [true],
			crossTextFontFamily : ["'Arial'"],
			crossTextFontSize : [12],
			crossTextFontStyle : ["normal"],
			crossTextFontColor : ["rgba(220,220,220,1)"],
			crossTextRelativePosX : [2],
			crossTextRelativePosY : [2],
			crossTextBaseline: ["middle"],
			crossTextAlign : ["center"],
			crossTextPosX : [0],
			crossTextPosY : [0],
			crossTextAngle : [0],
			crossTextFunction : null,
			spaceTop : 0,
			spaceBottom : 0,
			spaceRight : 0,
			spaceLeft : 0
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
			canvasBorders : false,
			canvasBordersWidth : 3,
			canvasBordersColor : "black",
			graphTitle : "",
			graphTitleFontFamily : "'Arial'",
			graphTitleFontSize : 24,
			graphTitleFontStyle : "bold",
			graphTitleFontColor : "#666",
			graphSubTitle : "",
			graphSubTitleFontFamily : "'Arial'",
			graphSubTitleFontSize : 18,
			graphSubTitleFontStyle : "normal",
			graphSubTitleFontColor : "#666",
			footNote : "",
			footNoteFontFamily : "'Arial'",
			footNoteFontSize : 8,
			footNoteFontStyle : "bold",
			footNoteFontColor : "#666",
			legend : false,
			legendFontFamily : "'Arial'",
			legendFontSize : 12,
			legendFontStyle : "normal",
			legendFontColor : "#666",
			legendBlockSize : 15,
			legendBorders : true,
			legendBordersWidth : 1,
			legendBordersColors : "#666" ,
			annotateDisplay : false,
			annotateFunction : "mousemove",
			annotateFontFamily : "'Arial'",
			annotateBorder : "thin solid black",
			annotateBackgroundColor : "#66FFCC",
			annotateFontSize : 4,
			annotateFontStyle : "normal",
			annotateFontColor : "#666",
			annotateLabel : "<%=(v1 == ''? '' : v1+':')+ roundToWithThousands(v2,2) + ' (' + roundToWithThousands(v6,1) + ' %)'%>" ,
			crossText : [""],
			crossTextOverlay :   [true],
			crossTextFontFamily : ["'Arial'"],
			crossTextFontSize : [12],
			crossTextFontStyle : ["normal"],
			crossTextFontColor : ["rgba(220,220,220,1)"],
			crossTextRelativePosX : [2],
			crossTextRelativePosY : [2],
			crossTextBaseline: ["middle"],
			crossTextAlign : ["center"],
			crossTextPosX : [0],
			crossTextPosY : [0],
			crossTextAngle : [0],
			crossTextFunction : null,
			spaceTop : 0,
			spaceBottom : 0,
			spaceRight : 0,
			spaceLeft : 0
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
			canvasBorders : false,
			canvasBordersWidth : 3,
			canvasBordersColor : "black",
			graphTitle : "",
			graphTitleFontFamily : "'Arial'",
			graphTitleFontSize : 24,
			graphTitleFontStyle : "bold",
			graphTitleFontColor : "#666",
			graphSubTitle : "",
			graphSubTitleFontFamily : "'Arial'",
			graphSubTitleFontSize : 18,
			graphSubTitleFontStyle : "normal",
			graphSubTitleFontColor : "#666",
			footNote : "",
			footNoteFontFamily : "'Arial'",
			footNoteFontSize : 8,
			footNoteFontStyle : "bold",
			footNoteFontColor : "#666",
			legend : false,
			legendFontFamily : "'Arial'",
			legendFontSize : 12,
			legendFontStyle : "normal",
			legendFontColor : "#666",
			legendBlockSize : 15,
			legendBorders : true,
			legendBordersWidth : 1,
			legendBordersColors : "#666" ,
			annotateDisplay : false,
			annotateFunction : "mousemove",
			annotateFontFamily : "'Arial'",
			annotateBorder : "thin solid black",
			annotateBackgroundColor : "#66FFCC",
			annotateFontSize : 4,
			annotateFontStyle : "normal",
			annotateFontColor : "#666",
			annotateLabel : "<%=(v1 == ''? '' : v1+':')+ roundToWithThousands(v2,2) + ' (' + roundToWithThousands(v6,1) + ' %)'%>" ,
			crossText : [""],
			crossTextOverlay :   [true],
			crossTextFontFamily : ["'Arial'"],
			crossTextFontSize : [12],
			crossTextFontStyle : ["normal"],
			crossTextFontColor : ["rgba(220,220,220,1)"],
			crossTextRelativePosX : [2],
			crossTextRelativePosY : [2],
			crossTextBaseline: ["middle"],
			crossTextAlign : ["center"],
			crossTextPosX : [0],
			crossTextPosY : [0],
			crossTextAngle : [0],
			crossTextFunction : null,
			spaceTop : 0,
			spaceBottom : 0,
			spaceRight : 0,
			spaceLeft : 0
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
      scaleTickSizeLeft : 5,
      scaleTickSizeRight : 5,
      scaleTickSizeBottom : 5,
      scaleTickSizeTop : 5,
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
			canvasBorders : false,
			canvasBordersWidth : 3,
			canvasBordersColor : "black",
			yAxisLeft : true,
			yAxisRight : false,
			xAxisBottom : true,
			xAxisTop : false,
			yAxisLabel : "",
			yAxisFontFamily : "'Arial'",
			yAxisFontSize : 16,
			yAxisFontStyle : "normal",
			yAxisFontColor : "#666",
			xAxisLabel : "",
			xAxisFontFamily : "'Arial'",
			xAxisFontSize : 16,
			xAxisFontStyle : "normal",
			xAxisFontColor : "#666",
			yAxisUnit : "",
			yAxisUnitFontFamily : "'Arial'",
			yAxisUnitFontSize : 8,
			yAxisUnitFontStyle : "normal",
			yAxisUnitFontColor : "#666",
			graphTitle : "",
			graphTitleFontFamily : "'Arial'",
			graphTitleFontSize : 24,
			graphTitleFontStyle : "bold",
			graphTitleFontColor : "#666",
			graphSubTitle : "",
			graphSubTitleFontFamily : "'Arial'",
			graphSubTitleFontSize : 18,
			graphSubTitleFontStyle : "normal",
			graphSubTitleFontColor : "#666",
			footNote : "",
			footNoteFontFamily : "'Arial'",
			footNoteFontSize : 8,
			footNoteFontStyle : "bold",
			footNoteFontColor : "#666",
			legend : false,
			legendFontFamily : "'Arial'",
			legendFontSize : 12,
			legendFontStyle : "normal",
			legendFontColor : "#666",
			legendBlockSize : 15,
			legendBorders : true,
			legendBordersWidth : 1,
			legendBordersColors : "#666",
			annotateDisplay : false,
			annotateFunction : "mousemove",
			annotateFontFamily : "'Arial'",
			annotateBorder : "thin solid black",
			annotateBackgroundColor : "#66FFCC",
			annotateFontSize : 4,
			annotateFontStyle : "normal",
			annotateFontColor : "#666",
			annotateLabel : "<%=(v1 == '' ? '' : v1) + (v1!='' && v2 !='' ? '/' : '')+(v2 == '' ? '' : v2)+(v1!='' || v2 !='' ? ':' : '') + roundToWithThousands(v3,2)%>" ,
			crossText : [""],
			crossTextOverlay :   [true],
			crossTextFontFamily : ["'Arial'"],
			crossTextFontSize : [12],
			crossTextFontStyle : ["normal"],
			crossTextFontColor : ["rgba(220,220,220,1)"],
			crossTextRelativePosX : [2],
			crossTextRelativePosY : [2],
			crossTextBaseline: ["middle"],
			crossTextAlign : ["center"],
			crossTextPosX : [0],
			crossTextPosY : [0],
			crossTextAngle : [0],
			crossTextFunction : null,
			spaceTop : 0,
			spaceBottom : 0,
			spaceRight : 0,
			spaceLeft : 0
		};
		var config = (options) ? mergeChartConfig(chart.Line.defaults,options) : chart.Line.defaults;

		return new Line(data,config,context);
	};


	this.StackedBar = function(data,options){

		chart.StackedBar.defaults = {
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
			scaleTickSizeLeft : 5,
			scaleTickSizeRight : 5,
			scaleTickSizeBottom : 5,
			scaleTickSizeTop : 5,
			barShowStroke : true,
			barStrokeWidth : 2,
			barValueSpacing : 5,
			barDatasetSpacing : 1,
			animation : true,
			animationSteps : 60,
			animationEasing : "easeOutQuart",
			onAnimationComplete : null,
			canvasBorders : false,
			canvasBordersWidth : 3,
			canvasBordersColor : "black",
			yAxisLeft : true,
			yAxisRight : false,
			xAxisBottom : true,
			xAxisTop : false,
			yAxisLabel : "",
			yAxisFontFamily : "'Arial'",
			yAxisFontSize : 16,
			yAxisFontStyle : "normal",
			yAxisFontColor : "#666",
			xAxisLabel : "",
			xAxisFontFamily : "'Arial'",
			xAxisFontSize : 16,
			xAxisFontStyle : "normal",
			xAxisFontColor : "#666",
			yAxisUnit : "",
			yAxisUnitFontFamily : "'Arial'",
			yAxisUnitFontSize : 8,
			yAxisUnitFontStyle : "normal",
			yAxisUnitFontColor : "#666",
			graphTitle : "",
			graphTitleFontFamily : "'Arial'",
			graphTitleFontSize : 24,
			graphTitleFontStyle : "bold",
			graphTitleFontColor : "#666",
			graphSubTitle : "",
			graphSubTitleFontFamily : "'Arial'",
			graphSubTitleFontSize : 18,
			graphSubTitleFontStyle : "normal",
			graphSubTitleFontColor : "#666",
			footNote : "",
			footNoteFontFamily : "'Arial'",
			footNoteFontSize : 8,
			footNoteFontStyle : "bold",
			footNoteFontColor : "#666",
			legend : false,
			legendFontFamily : "'Arial'",
			legendFontSize : 12,
			legendFontStyle : "normal",
			legendFontColor : "#666",
			legendBlockSize : 15,
			legendBorders : true,
			legendBordersWidth : 1,
			legendBordersColors : "#666",
			annotateDisplay : false,
			annotateFunction : "mousemove",
			annotateFontFamily : "'Arial'",
			annotateBorder : "thin solid black",
			annotateBackgroundColor : "#66FFCC",
			annotateFontSize : 4,
			annotateFontStyle : "normal",
			annotateFontColor : "#666",
			annotateLabel : "<%=(v1 == '' ? '' : v1) + (v1!='' && v2 !='' ? '/' : '')+(v2 == '' ? '' : v2)+(v1!='' || v2 !='' ? ':' : '') + roundToWithThousands(v3,2) + ' (' + roundToWithThousands(v6,1) + ' %)'%>" ,
			crossText : [""],
			crossTextOverlay :   [true],
			crossTextFontFamily : ["'Arial'"],
			crossTextFontSize : [12],
			crossTextFontStyle : ["normal"],
			crossTextFontColor : ["rgba(220,220,220,1)"],
			crossTextRelativePosX : [2],
			crossTextRelativePosY : [2],
			crossTextBaseline: ["middle"],
			crossTextAlign : ["center"],
			crossTextPosX : [0],
			crossTextPosY : [0],
			crossTextAngle : [0],
			crossTextFunction : null,
			spaceTop : 0,
			spaceBottom : 0,
			spaceRight : 0,
			spaceLeft : 0
		};
		var config = (options) ? mergeChartConfig(chart.StackedBar.defaults,options) : chart.StackedBar.defaults;
		return new StackedBar(data,config,context);
	};

	this.HorizontalStackedBar = function(data,options){

		chart.HorizontalStackedBar.defaults = {
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
			scaleTickSizeLeft : 5,
			scaleTickSizeRight : 5,
			scaleTickSizeBottom : 5,
			scaleTickSizeTop : 5,
			barShowStroke : true,
			barStrokeWidth : 2,
			barValueSpacing : 5,
			barDatasetSpacing : 1,
			animation : true,
			animationSteps : 60,
			animationEasing : "easeOutQuart",
			onAnimationComplete : null,
			canvasBorders : false,
			canvasBordersWidth : 3,
			canvasBordersColor : "black",
			yAxisLeft : true,
			yAxisRight : false,
			xAxisBottom : true,
			xAxisTop : false,
			yAxisLabel : "",
			yAxisFontFamily : "'Arial'",
			yAxisFontSize : 16,
			yAxisFontStyle : "normal",
			yAxisFontColor : "#666",
			xAxisLabel : "",
			xAxisFontFamily : "'Arial'",
			xAxisFontSize : 16,
			xAxisFontStyle : "normal",
			xAxisFontColor : "#666",
			yAxisUnit : "",
			yAxisUnitFontFamily : "'Arial'",
			yAxisUnitFontSize : 8,
			yAxisUnitFontStyle : "normal",
			yAxisUnitFontColor : "#666",
			graphTitle : "",
			graphTitleFontFamily : "'Arial'",
			graphTitleFontSize : 24,
			graphTitleFontStyle : "bold",
			graphTitleFontColor : "#666",
			graphSubTitle : "",
			graphSubTitleFontFamily : "'Arial'",
			graphSubTitleFontSize : 18,
			graphSubTitleFontStyle : "normal",
			graphSubTitleFontColor : "#666",
			footNote : "",
			footNoteFontFamily : "'Arial'",
			footNoteFontSize : 8,
			footNoteFontStyle : "bold",
			footNoteFontColor : "#666",
			legend : false,
			legendFontFamily : "'Arial'",
			legendFontSize : 12,
			legendFontStyle : "normal",
			legendFontColor : "#666",
			legendBlockSize : 15,
			legendBorders : true,
			legendBordersWidth : 1,
			legendBordersColors : "#666",
			annotateDisplay : false,
			annotateFunction : "mousemove",
			annotateFontFamily : "'Arial'",
			annotateBorder : "thin solid black",
			annotateBackgroundColor : "#66FFCC",
			annotateFontSize : 4,
			annotateFontStyle : "normal",
			annotateFontColor : "#666",
			annotateLabel : "<%=(v1 == '' ? '' : v1) + (v1!='' && v2 !='' ? '/' : '')+(v2 == '' ? '' : v2)+(v1!='' || v2 !='' ? ':' : '') + roundToWithThousands(v3,2) + ' (' + roundToWithThousands(v6,1) + ' %)'%>" ,
			crossText : [""],
			crossTextOverlay :   [true],
			crossTextFontFamily : ["'Arial'"],
			crossTextFontSize : [12],
			crossTextFontStyle : ["normal"],
			crossTextFontColor : ["rgba(220,220,220,1)"],
			crossTextRelativePosX : [2],
			crossTextRelativePosY : [2],
			crossTextBaseline: ["middle"],
			crossTextAlign : ["center"],
			crossTextPosX : [0],
			crossTextPosY : [0],
			crossTextAngle : [0],
			crossTextFunction : null,
			spaceTop : 0,
			spaceBottom : 0,
			spaceRight : 0,
			spaceLeft : 0
		};
		var config = (options) ? mergeChartConfig(chart.HorizontalStackedBar.defaults,options) : chart.HorizontalStackedBar.defaults;
		return new HorizontalStackedBar(data,config,context);
	};


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
      scaleTickSizeLeft : 5,
      scaleTickSizeRight : 5,
      scaleTickSizeBottom : 5,
      scaleTickSizeTop : 5,
			barShowStroke : true,
			barStrokeWidth : 2,
			barValueSpacing : 5,
			barDatasetSpacing : 1,
			animation : true,
			animationSteps : 60,
			animationEasing : "easeOutQuart",
			onAnimationComplete : null,
			canvasBorders : false,
			canvasBordersWidth : 3,
			canvasBordersColor : "black",
			yAxisLabel : "",
			yAxisFontFamily : "'Arial'",
			yAxisFontSize : 12,
			yAxisFontStyle : "normal",
			yAxisFontColor : "#666",
			xAxisLabel : "",
			xAxisFontFamily : "'Arial'",
			xAxisFontSize : 12,
			xAxisFontStyle : "normal",
			xAxisFontColor : "#666",
			yAxisUnit : "",
			yAxisUnitFontFamily : "'Arial'",
			yAxisUnitFontSize : 12,
			yAxisUnitFontStyle : "normal",
			yAxisUnitFontColor : "#666",
			graphTitle : "",
			graphTitleFontFamily : "'Arial'",
			graphTitleFontSize : 12,
			graphTitleFontStyle : "normal",
			graphTitleFontColor : "#666",
			graphSubTitle : "",
			graphSubTitleFontFamily : "'Arial'",
			graphSubTitleFontSize : 12,
			graphSubTitleFontStyle : "normal",
			graphSubTitleFontColor : "#666",
			footNote : "",
			footNoteFontFamily : "'Arial'",
			footNoteFontSize : 8,
			footNoteFontStyle : "bold",
			footNoteFontColor : "#666",
			yAxisLeft : true,
			yAxisRight : false,
			legend : false,
			legendFontFamily : "'Arial'",
			legendFontSize : 12,
			legendFontStyle : "normal",
			legendFontColor : "#666",
			legendBlockSize : 15,
			legendBorders : true,
			legendBordersWidth : 1,
			legendBordersColors : "#666",
			annotateDisplay : false,
			annotateFunction : "mousemove",
			annotateFontFamily : "'Arial'",
			annotateBorder : "thin solid black",
			annotateBackgroundColor : "#66FFCC",
			annotateFontSize : 4,
			annotateFontStyle : "normal",
			annotateFontColor : "#666",
			annotateLabel : "<%=(v1 == '' ? '' : v1) + (v1!='' && v2 !='' ? '/' : '')+(v2 == '' ? '' : v2)+(v1!='' || v2 !='' ? ':' : '') + roundToWithThousands(v3,2) + ' (' + roundToWithThousands(v6,1) + ' %)'%>" ,
			crossText : [""],
			crossTextOverlay :   [true],
			crossTextFontFamily : ["'Arial'"],
			crossTextFontSize : [12],
			crossTextFontStyle : ["normal"],
			crossTextFontColor : ["rgba(220,220,220,1)"],
			crossTextRelativePosX : [2],
			crossTextRelativePosY : [2],
			crossTextBaseline: ["middle"],
			crossTextAlign : ["center"],
			crossTextPosX : [0],
			crossTextPosY : [0],
			crossTextAngle : [0],
			crossTextFunction : null,
			spaceTop : 0,
			spaceBottom : 0,
			spaceRight : 0,
			spaceLeft : 0
		};
		var config = (options) ? mergeChartConfig(chart.Bar.defaults,options) : chart.Bar.defaults;

		return new Bar(data,config,context);
	}

	this.HorizontalBar = function(data,options){
		chart.HorizontalBar.defaults = {
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
			scaleTickSizeLeft : 5,
			scaleTickSizeRight : 5,
			scaleTickSizeBottom : 5,
			scaleTickSizeTop : 5,
			barShowStroke : true,
			barStrokeWidth : 2,
			barValueSpacing : 5,
			barDatasetSpacing : 1,
			animation : true,
			animationSteps : 60,
			animationEasing : "easeOutQuart",
			onAnimationComplete : null,
			canvasBorders : false,
			canvasBordersWidth : 3,
			canvasBordersColor : "black",
			yAxisLabel : "",
			yAxisFontFamily : "'Arial'",
			yAxisFontSize : 12,
			yAxisFontStyle : "normal",
			yAxisFontColor : "#666",
			xAxisLabel : "",
			xAxisFontFamily : "'Arial'",
			xAxisFontSize : 12,
			xAxisFontStyle : "normal",
			xAxisFontColor : "#666",
			yAxisUnit : "",
			yAxisUnitFontFamily : "'Arial'",
			yAxisUnitFontSize : 12,
			yAxisUnitFontStyle : "normal",
			yAxisUnitFontColor : "#666",
			graphTitle : "",
			graphTitleFontFamily : "'Arial'",
			graphTitleFontSize : 12,
			graphTitleFontStyle : "normal",
			graphTitleFontColor : "#666",
			graphSubTitle : "",
			graphSubTitleFontFamily : "'Arial'",
			graphSubTitleFontSize : 12,
			graphSubTitleFontStyle : "normal",
			graphSubTitleFontColor : "#666",
			footNote : "",
			footNoteFontFamily : "'Arial'",
			footNoteFontSize : 8,
			footNoteFontStyle : "bold",
			footNoteFontColor : "#666",
			yAxisLeft : true,
			yAxisRight : false,
			legend : false,
			legendFontFamily : "'Arial'",
			legendFontSize : 12,
			legendFontStyle : "normal",
			legendFontColor : "#666",
			legendBlockSize : 15,
			legendBorders : true,
			legendBordersWidth : 1,
			legendBordersColors : "#666",
			annotateDisplay : false,
			annotateFunction : "mousemove",
			annotateFontFamily : "'Arial'",
			annotateBorder : "thin solid black",
			annotateBackgroundColor : "#66FFCC",
			annotateFontSize : 4,
			annotateFontStyle : "normal",
			annotateFontColor : "#666",
			annotateLabel : "<%=(v1 == '' ? '' : v1) + (v1!='' && v2 !='' ? '/' : '')+(v2 == '' ? '' : v2)+(v1!='' || v2 !='' ? ':' : '') + roundToWithThousands(v3,2) + ' (' + roundToWithThousands(v6,1) + ' %)'%>" ,
			crossText : [""],
			crossTextOverlay :   [true],
			crossTextFontFamily : ["'Arial'"],
			crossTextFontSize : [12],
			crossTextFontStyle : ["normal"],
			crossTextFontColor : ["rgba(220,220,220,1)"],
			crossTextRelativePosX : [2],
			crossTextRelativePosY : [2],
			crossTextBaseline: ["middle"],
			crossTextAlign : ["center"],
			crossTextPosX : [0],
			crossTextPosY : [0],
			crossTextAngle : [0],
			crossTextFunction : null,
			spaceTop : 0,
			spaceBottom : 0,
			spaceRight : 0,
			spaceLeft : 0

		};
		var config = (options) ? mergeChartConfig(chart.HorizontalBar.defaults,options) : chart.HorizontalBar.defaults;

		return new HorizontalBar(data,config,context);
	};




	var clear = function(c){
		c.clearRect(0, 0, width, height);
	};

	var PolarArea = function(data,config,ctx){
		var maxSize, scaleHop, calculatedScale, labelHeight, scaleHeight, valueBounds, labelTemplateString, msr,midPosX,midPosY;

		var annotateCnt=0;
		jsGraphAnnotate[ctx.canvas.id]=new Array();

		if(config.annotateDisplay==true)
		{
			if(cursorDivCreated==false)oCursor=new makeCursorObj('divCursor');
			if(isIE() <9 && isIE()!= false)ctx.canvas.attachEvent("on"+config.annotateFunction,function(event){doMouseMove(ctx,config,event)});
			else ctx.canvas.addEventListener(config.annotateFunction,function(event){doMouseMove(ctx,config,event)},false);

		}
		clear(ctx);
		ctx.clearRect(0,0,width,height);

		valueBounds = getValueBounds();
		//Check and set the scale
		labelTemplateString = (config.scaleShowLabels)? config.scaleLabel : "";

		if (!config.scaleOverride){

			calculatedScale = calculateScale(valueBounds.maxSteps,valueBounds.minSteps,valueBounds.maxValue,valueBounds.minValue,labelTemplateString);
			msr=setMeasures(data,config,ctx,height,width,calculatedScale.labels,true,false,false,false);
		}
		else {
			calculatedScale = {
				steps : config.scaleSteps,
				stepValue : config.scaleStepWidth,
				graphMin : config.scaleStartValue,
				labels : []
			}
			populateLabels(labelTemplateString, calculatedScale.labels,calculatedScale.steps,config.scaleStartValue,config.scaleStepWidth);
			msr=setMeasures(data,config,ctx,height,width,calculatedScale.labels,true,false,false,false);
		}


		midPosX=msr.leftNotUsableSize+(msr.availableWidth/2);
		midPosY=msr.topNotUsableSize+(msr.availableHeight/2);


		scaleHop = Math.floor(((Min([msr.availableHeight,msr.availableWidth])/2)-5)/calculatedScale.steps);


		//Wrap in an animation loop wrapper
		animationLoop(config,drawScale,drawAllSegments,ctx,msr.clrx,msr.clry,msr.clrwidth,msr.clrheight,midPosX,midPosY,midPosX-((Min([msr.availableHeight,msr.availableWidth])/2)-5),midPosY+((Min([msr.availableHeight,msr.availableWidth])/2)-5),data);


		function drawAllSegments(animationDecimal){
			var startAngle = -Math.PI/2,
			cumvalue=0,
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
			if(animationDecimal>=1)
			{
				totvalue=0;
				for (var i=0; i<data.length; i++)totvalue+= data[i].value;
			}

			for (var i=0; i<data.length; i++){

				ctx.beginPath();
				ctx.arc(midPosX,midPosY,scaleAnimation * calculateOffset(data[i].value,calculatedScale,scaleHop),startAngle, startAngle + rotateAnimation*angleStep, false);
				ctx.lineTo(midPosX,midPosY);
				ctx.closePath();
				ctx.fillStyle = data[i].color;
				ctx.fill();

				startAngle += angleStep;
				cumvalue +=data[i].value;

				if(animationDecimal>=1)
				{
					if(typeof(data[i].title)=="string")lgtxt=data[i].title.trim();
					else lgtxt="";

					jsGraphAnnotate[ctx.canvas.id][annotateCnt++]=["ARC",midPosX,midPosY,0,calculateOffset(data[i].value,calculatedScale,scaleHop),startAngle - angleStep,startAngle,lgtxt,data[i].value,cumvalue,totvalue,angleStep,i];
				}
				if(config.segmentShowStroke){
					ctx.strokeStyle = config.segmentStrokeColor;
					ctx.lineWidth = config.segmentStrokeWidth;
					ctx.stroke();
				}
			}


		}


		function drawScale(){
			for (var i=0; i<calculatedScale.steps; i++){
				//If the line object is there
				if (config.scaleShowLine){
					ctx.beginPath();
					ctx.arc(midPosX, midPosY, scaleHop * (i + 1), 0, (Math.PI * 2), true);
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
							Math.round(midPosX - textWidth/2 - config.scaleBackdropPaddingX),     //X
							Math.round(midPosY - (scaleHop * (i + 1)) - config.scaleFontSize*0.5 - config.scaleBackdropPaddingY),//Y
							Math.round(textWidth + (config.scaleBackdropPaddingX*2)), //Width
							Math.round(config.scaleFontSize + (config.scaleBackdropPaddingY*2)) //Height
						);
						ctx.fill();
					}
					ctx.textBaseline = "middle";
					ctx.fillStyle = config.scaleFontColor;
					ctx.fillText(label,midPosX,midPosY - (scaleHop * (i + 1)));
				}
			}
		}
		function getValueBounds() {
			var upperValue = Number.MIN_VALUE;
			var lowerValue = Number.MAX_VALUE;
			for (var i=0; i<data.length; i++){
				if (data[i].value > upperValue) {upperValue = data[i].value;}
				if (data[i].value < lowerValue) {lowerValue = data[i].value;}
			};

			if(!isNaN(config.graphMin) )lowerValue=config.graphMin;
			if(!isNaN(config.graphMax) )upperValue=config.graphMax;

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
		var maxSize, scaleHop, calculatedScale, labelHeight, scaleHeight, valueBounds, labelTemplateString, msr,midPosX,midPosY;

		var annotateCnt=0;
		jsGraphAnnotate[ctx.canvas.id]=new Array();

		if(config.annotateDisplay==true)
		{
			if(cursorDivCreated==false)oCursor=new makeCursorObj('divCursor');
			if(isIE() <9 && isIE()!= false)ctx.canvas.attachEvent("on"+config.annotateFunction,function(event){doMouseMove(ctx,config,event)});
			else ctx.canvas.addEventListener(config.annotateFunction,function(event){doMouseMove(ctx,config,event)},false);

		}

		//If no labels are defined set to an empty array, so referencing length for looping doesn't blow up.
		if (!data.labels) data.labels = [];

		clear(ctx);
		ctx.clearRect(0,0,width,height);

		valueBounds = getValueBounds();
		//Check and set the scale
		labelTemplateString = (config.scaleShowLabels)? config.scaleLabel : "";

		if (!config.scaleOverride){

			calculatedScale = calculateScale(valueBounds.maxSteps,valueBounds.minSteps,valueBounds.maxValue,valueBounds.minValue,labelTemplateString);
			msr=setMeasures(data,config,ctx,height,width,calculatedScale.labels,true,false,false,true);
		}
		else {
			calculatedScale = {
				steps : config.scaleSteps,
				stepValue : config.scaleStepWidth,
				graphMin : config.scaleStartValue,
				labels : []
			}
			populateLabels(labelTemplateString, calculatedScale.labels,calculatedScale.steps,config.scaleStartValue,config.scaleStepWidth);
			msr=setMeasures(data,config,ctx,height,width,calculatedScale.labels,true,false,false,true);
		}


		midPosX=msr.leftNotUsableSize+(msr.availableWidth/2);
		midPosY=msr.topNotUsableSize+(msr.availableHeight/2);

		calculateDrawingSizes()
		scaleHop = maxSize/(calculatedScale.steps);



		//Wrap in an animation loop wrapper
		animationLoop(config,drawScale,drawAllDataPoints,ctx,msr.clrx,msr.clry,msr.clrwidth,msr.clrheight,midPosX,midPosY,midPosX-maxSize,midPosY+maxSize,data);

		//Radar specific functions.
		function drawAllDataPoints(animationDecimal){


			var totvalue=new Array();
			var maxvalue=new Array();

			for (var i=0; i<data.datasets.length; i++){for (var j=0; j<data.datasets[i].data.length; j++){totvalue[j]=0;maxvalue[j]=-999999999;} }
			for (var i=0; i<data.datasets.length; i++){for (var j=0; j<data.datasets[i].data.length; j++){totvalue[j]+=data.datasets[i].data[j];maxvalue[j]=Max( [maxvalue[j],data.datasets[i].data[j]]);} }

			var rotationDegree = (2*Math.PI)/data.datasets[0].data.length;

			ctx.save();
			//translate to the centre of the canvas.
			ctx.translate(midPosX,midPosY);

			//We accept multiple data sets for radar charts, so show loop through each set
			for (var i=0; i<data.datasets.length; i++){

				if(animationDecimal>=1)
				{
					 if(typeof(data.datasets[i].title)=="string")lgtxt=data.datasets[i].title.trim();
					 else lgtxt="";
				}

				ctx.beginPath();

				ctx.moveTo(0,animationDecimal*(-1*calculateOffset(data.datasets[i].data[0],calculatedScale,scaleHop)));

				if(animationDecimal>=1)
				{
					if(i==0)divprev=0;
					else divprev= data.datasets[i].data[0]-data.datasets[i-1].data[0];
					if(i==data.datasets.length-1)divnext=0;
					else divnext=data.datasets[i+1].data[0]-data.datasets[i].data[0];
					if(typeof(data.labels[0])=="string")lgtxt2=data.labels[0].trim();
					else lgtxt2="";

					jsGraphAnnotate[ctx.canvas.id][annotateCnt++]=["POINT",midPosX,midPosY-1*calculateOffset(data.datasets[i].data[0],calculatedScale,scaleHop),lgtxt,lgtxt2,data.datasets[i].data[0],divprev,divnext,maxvalue[0],totvalue[0],i,0];
				}

				for (var j=1; j<data.datasets[i].data.length; j++){
					ctx.rotate(rotationDegree);
					ctx.lineTo(0,animationDecimal*(-1*calculateOffset(data.datasets[i].data[j],calculatedScale,scaleHop)));

					if(animationDecimal>=1)
					{
						if(i==0)divprev=0;
						else divprev= data.datasets[i].data[j]-data.datasets[i-1].data[j];
						if(i==data.datasets.length-1)divnext=0;
						else divnext=data.datasets[i+1].data[j]-data.datasets[i].data[j];
						if(typeof(data.labels[j])=="string")lgtxt2=data.labels[j].trim();
						else lgtxt2="";
						jsGraphAnnotate[ctx.canvas.id][annotateCnt++]=["POINT",midPosX+Math.cos((Math.PI/2)-j*rotationDegree)*calculateOffset(data.datasets[i].data[j],calculatedScale,scaleHop),midPosY-Math.sin((Math.PI/2)-j*rotationDegree)*calculateOffset(data.datasets[i].data[j],calculatedScale,scaleHop),lgtxt,lgtxt2,data.datasets[i].data[j],divprev,divnext,maxvalue[j],totvalue[j],i,j];
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
				ctx.translate(midPosX, midPosY);

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
							Math.round(- textWidth/2 - config.scaleBackdropPaddingX),     //X
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
			maxSize = (Min([msr.availableWidth,msr.availableHeight])/2);

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

			if(!isNaN(config.graphMin) )lowerValue=config.graphMin;
			if(!isNaN(config.graphMax) )upperValue=config.graphMax;

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
		var msr,midPieX,midPieY;


		var annotateCnt=0;
		jsGraphAnnotate[ctx.canvas.id]=new Array();

		if(config.annotateDisplay==true)
		{
			 if(cursorDivCreated==false)
			 {
						oCursor=new makeCursorObj('divCursor');
			 }
			if(isIE() <9 && isIE()!= false)ctx.canvas.attachEvent("on"+config.annotateFunction,function(event){doMouseMove(ctx,config,event)});
			else ctx.canvas.addEventListener(config.annotateFunction,function(event){doMouseMove(ctx,config,event)},false);
	 }

		//In case we have a canvas that is not a square. Minus 5 pixels as padding round the edge.

		clear(ctx);
		ctx.clearRect(0,0,width,height);

		msr=setMeasures(data,config,ctx,height,width,null,true,false,false,false);

		midPieX=msr.leftNotUsableSize+(msr.availableWidth/2);
		midPieY=msr.topNotUsableSize+(msr.availableHeight/2);


		var pieRadius = Min([msr.availableHeight/2,msr.availableWidth/2]) - 5;

		for (var i=0; i<data.length; i++){
			segmentTotal += data[i].value;
		}


		animationLoop(config,null,drawPieSegments,ctx,msr.clrx,msr.clry,msr.clrwidth,msr.clrheight,midPieX,midPieY,midPieX-pieRadius,midPieY+pieRadius,data);



		function drawPieSegments (animationDecimal){

			var cumulativeAngle = -Math.PI/2,
			cumvalue=0,
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
			if(animationDecimal>=1)
			{
				totvalue=0;
				for (var i=0; i<data.length; i++)totvalue+= data[i].value;
			}

			for (var i=0; i<data.length; i++){
				var segmentAngle = rotateAnimation * ((data[i].value/segmentTotal) * (Math.PI*2));
				ctx.beginPath();
				ctx.arc(midPieX,midPieY,scaleAnimation * pieRadius,cumulativeAngle,cumulativeAngle + segmentAngle);
				ctx.lineTo(midPieX,midPieY);
				ctx.closePath();
				ctx.fillStyle = data[i].color;
				ctx.fill();

				cumulativeAngle += segmentAngle;
				cumvalue +=data[i].value;

				if(animationDecimal>=1)
				{
					if(typeof(data[i].title)=="string")lgtxt=data[i].title.trim();
					else lgtxt="";
					jsGraphAnnotate[ctx.canvas.id][annotateCnt++]=["ARC",midPieX,midPieY,0,pieRadius,cumulativeAngle - segmentAngle,cumulativeAngle,lgtxt,data[i].value,cumvalue,totvalue,segmentAngle,i];
				}

				if(config.segmentShowStroke){
					ctx.lineWidth = config.segmentStrokeWidth;
					ctx.strokeStyle = config.segmentStrokeColor;
					ctx.stroke();
				}
			}
		}
	}

	var Doughnut = function(data,config,ctx){
		var segmentTotal = 0;
		var msr,midPieX,midPieY;


		var annotateCnt=0;
		jsGraphAnnotate[ctx.canvas.id]=new Array();

		if(config.annotateDisplay==true)
		{
			if(cursorDivCreated==false)oCursor=new makeCursorObj('divCursor');
			if(isIE() <9 && isIE()!= false)ctx.canvas.attachEvent("on"+config.annotateFunction,function(event){doMouseMove(ctx,config,event)});
			else ctx.canvas.addEventListener(config.annotateFunction,function(event){doMouseMove(ctx,config,event)},false);
		}
		//In case we have a canvas that is not a square. Minus 5 pixels as padding round the edge.

		clear(ctx);
		ctx.clearRect(0,0,width,height);

		msr=setMeasures(data,config,ctx,height,width,null,true,false,false,false);


		midPieX=msr.leftNotUsableSize+(msr.availableWidth/2);
		midPieY=msr.topNotUsableSize+(msr.availableHeight/2);


		var doughnutRadius = Min([msr.availableHeight/2,msr.availableWidth/2]) - 5;

		var cutoutRadius = doughnutRadius * (config.percentageInnerCutout/100);

		for (var i=0; i<data.length; i++){
			segmentTotal += data[i].value;
		}


		animationLoop(config,null,drawPieSegments,ctx,msr.clrx,msr.clry,msr.clrwidth,msr.clrheight,midPieX,midPieY,midPieX-doughnutRadius,midPieY+doughnutRadius,data);

		function drawPieSegments (animationDecimal){
			var cumulativeAngle = -Math.PI/2,
			cumvalue=0,
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

			if(animationDecimal>=1)
			{
				totvalue=0;
				for (var i=0; i<data.length; i++)totvalue+= data[i].value;
			}

			for (var i=0; i<data.length; i++){
				var segmentAngle = rotateAnimation * ((data[i].value/segmentTotal) * (Math.PI*2));
				ctx.beginPath();
				ctx.arc(midPieX,midPieY,scaleAnimation * doughnutRadius,cumulativeAngle,cumulativeAngle + segmentAngle,false);
				ctx.arc(midPieX,midPieY,scaleAnimation * cutoutRadius,cumulativeAngle + segmentAngle,cumulativeAngle,true);
				ctx.closePath();
				ctx.fillStyle = data[i].color;
				ctx.fill();

				cumulativeAngle += segmentAngle;
				cumvalue +=data[i].value;


				if(animationDecimal>=1)
				{
					if(typeof(data[i].title)=="string")lgtxt=data[i].title.trim();
					else lgtxt="";

					jsGraphAnnotate[ctx.canvas.id][annotateCnt++]=["ARC",midPieX,midPieY,cutoutRadius,doughnutRadius,cumulativeAngle - segmentAngle,cumulativeAngle,lgtxt,data[i].value,cumvalue,totvalue,segmentAngle,i];
				}

				if(config.segmentShowStroke){
					ctx.lineWidth = config.segmentStrokeWidth;
					ctx.strokeStyle = config.segmentStrokeColor;
					ctx.stroke();
				}
			}
		}



	}

	var Line = function(data,config,ctx){
		var maxSize, scaleHop, calculatedScale, labelHeight, scaleHeight, valueBounds, labelTemplateString, valueHop,widestXLabel, xAxisLength,yAxisPosX,xAxisPosY, rotateLabels = 0, msr;

		var annotateCnt=0;
		jsGraphAnnotate[ctx.canvas.id]=new Array();

		if(config.annotateDisplay==true)
		{
			if(cursorDivCreated==false)oCursor=new makeCursorObj('divCursor');
			if(isIE() <9 && isIE()!= false)ctx.canvas.attachEvent("on"+config.annotateFunction,function(event){doMouseMove(ctx,config,event)});
			else ctx.canvas.addEventListener(config.annotateFunction,function(event){doMouseMove(ctx,config,event)},false);

		}

		clear(ctx);
		ctx.clearRect(0,0,width,height);



		valueBounds = getValueBounds();
		//Check and set the scale
		labelTemplateString = (config.scaleShowLabels)? config.scaleLabel : "";

		if (!config.scaleOverride){

			calculatedScale = calculateScale(valueBounds.maxSteps,valueBounds.minSteps,valueBounds.maxValue,valueBounds.minValue,labelTemplateString);
			msr=setMeasures(data,config,ctx,height,width,calculatedScale.labels,false,false,true,true);
		}
		else {
			calculatedScale = {
				steps : config.scaleSteps,
				stepValue : config.scaleStepWidth,
				graphMin : config.scaleStartValue,
				labels : []
			}
			populateLabels(labelTemplateString, calculatedScale.labels,calculatedScale.steps,config.scaleStartValue,config.scaleStepWidth);
			msr=setMeasures(data,config,ctx,height,width,calculatedScale.labels,false,false,true,true);
		}

		msr.availableHeight=msr.availableHeight-config.scaleTickSizeBottom-config.scaleTickSizeTop;
		msr.availableWidth=msr.availableWidth-config.scaleTickSizeLeft-config.scaleTickSizeRight;

		scaleHop = Math.floor(msr.availableHeight/calculatedScale.steps);
		valueHop = Math.floor(msr.availableWidth/(data.labels.length-1));

		msr.availableWidth=(data.labels.length-1)*valueHop;
		msr.availableHeight=(calculatedScale.steps)*scaleHop;

		yAxisPosX=msr.leftNotUsableSize+config.scaleTickSizeLeft;
		xAxisPosY=msr.topNotUsableSize+msr.availableHeight+config.scaleTickSizeTop;

		animationLoop(config,drawScale,drawLines,ctx,msr.clrx,msr.clry,msr.clrwidth,msr.clrheight,yAxisPosX+msr.availableWidth/2,xAxisPosY-msr.availableHeight/2,yAxisPosX,xAxisPosY,data);

		function drawLines(animPc){

			var totvalue=new Array();
			var maxvalue=new Array();

			for (var i=0; i<data.datasets.length; i++){for (var j=0; j<data.datasets[i].data.length; j++){totvalue[j]=0;maxvalue[j]=-999999999;} }
			for (var i=0; i<data.datasets.length; i++){for (var j=0; j<data.datasets[i].data.length; j++){totvalue[j]+=data.datasets[i].data[j];maxvalue[j]=Max( [maxvalue[j],data.datasets[i].data[j]]);} }

			for (var i=0; i<data.datasets.length; i++){

				if(animPc>=1)
				{
					 if(typeof(data.datasets[i].title)=="string")lgtxt=data.datasets[i].title.trim();
					 else lgtxt="";
				}

				ctx.strokeStyle = data.datasets[i].strokeColor;
				ctx.lineWidth = config.datasetStrokeWidth;
				ctx.beginPath();
				ctx.moveTo(yAxisPosX, xAxisPosY - animPc*(calculateOffset(data.datasets[i].data[0],calculatedScale,scaleHop)));

				if(animPc>=1)
				{
					if(i==0)divprev=data.datasets[i].data[0];
					else divprev= data.datasets[i].data[0]-data.datasets[i-1].data[0];
					if(i==data.datasets.length-1)divnext=data.datasets[i].data[0];
					else divnext=data.datasets[i].data[0]-data.datasets[i+1].data[0];


					if(typeof(data.labels[0])=="string")lgtxt2=data.labels[0].trim();
					else lgtxt2="";

					jsGraphAnnotate[ctx.canvas.id][annotateCnt++]=["POINT",yAxisPosX,xAxisPosY - (calculateOffset(data.datasets[i].data[0],calculatedScale,scaleHop)),lgtxt,lgtxt2,data.datasets[i].data[0],divprev,divnext,maxvalue[0],totvalue[0],i,0];
				}
				for (var j=1; j<data.datasets[i].data.length; j++){
					if (config.bezierCurve){
						ctx.bezierCurveTo(xPos(j-0.5),yPos(i,j-1),xPos(j-0.5),yPos(i,j),xPos(j),yPos(i,j));
					}
					else{
						ctx.lineTo(xPos(j),yPos(i,j));
					}

					if(animPc>=1)
					{
						if(i==0)divprev=data.datasets[i].data[j];
						else divprev= data.datasets[i].data[j]-data.datasets[i-1].data[j];
						if(i==data.datasets.length-1)divnext=data.datasets[i].data[j];
						else divnext=data.datasets[i].data[j]-data.datasets[i+1].data[j];

						if(typeof(data.labels[j])=="string")lgtxt2=data.labels[j].trim();
						else lgtxt2="";
						jsGraphAnnotate[ctx.canvas.id][annotateCnt++]=["POINT",xPos(j),yPos(i,j),lgtxt,lgtxt2,data.datasets[i].data[j],divprev,divnext,maxvalue[j],totvalue[j],i,j];
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

			ctx.font = config.scaleFontStyle + " " + config.scaleFontSize+"px " + config.scaleFontFamily;


			//X axis line

			ctx.lineWidth = config.scaleLineWidth;
			ctx.strokeStyle = config.scaleLineColor;
			ctx.beginPath();
			ctx.moveTo(yAxisPosX-config.scaleTickSizeLeft,xAxisPosY);
			ctx.lineTo(yAxisPosX+msr.availableWidth+config.scaleTickSizeRight,xAxisPosY);

			ctx.stroke();

			if (msr.rotateLabels > 0){
				ctx.save();
				ctx.textAlign = "right";
			}
			else{
				ctx.textAlign = "center";
			}
			ctx.fillStyle = config.scaleFontColor;

			for (var i=0; i<data.labels.length; i++){
				ctx.save();
				if (msr.rotateLabels > 0){
					ctx.translate(yAxisPosX + i*valueHop,msr.xLabelPos);
					ctx.rotate(-(msr.rotateLabels * (Math.PI/180)));
					ctx.fillText(data.labels[i], 0,0);
				}
				else{
					ctx.fillText(data.labels[i], yAxisPosX + i*valueHop,msr.xLabelPos);
				}
				ctx.restore();

				ctx.beginPath();
				ctx.moveTo(yAxisPosX + i * valueHop, xAxisPosY+config.scaleTickSizeBottom);
				ctx.lineWidth = config.scaleGridLineWidth;
				ctx.strokeStyle = config.scaleGridLineColor;

				//Check i isnt 0, so we dont go over the Y axis twice.
				if(config.scaleShowGridLines && i>0){
					ctx.lineTo(yAxisPosX + i * valueHop,xAxisPosY-msr.availableHeight-config.scaleTickSizeTop  );
				}
				else{
					ctx.lineTo(yAxisPosX + i * valueHop, xAxisPosY);
				}
				ctx.stroke();
			}

			//Y axis

			ctx.lineWidth = config.scaleLineWidth;
			ctx.strokeStyle = config.scaleLineColor;
			ctx.beginPath();
			ctx.moveTo(yAxisPosX,xAxisPosY+config.scaleTickSizeBottom);
			ctx.lineTo(yAxisPosX,xAxisPosY-msr.availableHeight-config.scaleTickSizeTop);
			ctx.stroke();

			ctx.textAlign = "right";
			ctx.textBaseline = "middle";
			for (var j=0; j<calculatedScale.steps; j++){
				ctx.beginPath();
				ctx.moveTo(yAxisPosX-config.scaleTickSizeLeft,xAxisPosY - ((j+1) * scaleHop));
				ctx.lineWidth = config.scaleGridLineWidth;
				ctx.strokeStyle = config.scaleGridLineColor;
				if (config.scaleShowGridLines){
					ctx.lineTo(yAxisPosX + msr.availableWidth + config.scaleTickSizeRight,xAxisPosY - ((j+1) * scaleHop));
				}
				else{
					ctx.lineTo(yAxisPosX ,xAxisPosY - ((j+1) * scaleHop));
				}

				ctx.stroke();

				if (config.scaleShowLabels){
					if(config.yAxisLeft) {
						ctx.textAlign = "right";
						ctx.fillText(calculatedScale.labels[j],yAxisPosX-(config.scaleTickSizeLeft+3),xAxisPosY - ((j+1) * scaleHop));
					}
					if(config.yAxisRight) {
						ctx.textAlign = "left";
						ctx.fillText(calculatedScale.labels[j],yAxisPosX + msr.availableWidth + (config.scaleTickSizeRight+3),xAxisPosY - ((j+1) * scaleHop));
					}
				}
			}


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

			// AJOUT CHANGEMENT
			if(!isNaN(config.graphMin) )lowerValue=config.graphMin;
			if(!isNaN(config.graphMax) )upperValue=config.graphMax;

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

	var StackedBar = function(data,config,ctx){
		var maxSize, scaleHop, calculatedScale, labelHeight, scaleHeight, valueBounds, labelTemplateString, valueHop,widestXLabel, xAxisLength,yAxisPosX,xAxisPosY,barWidth, rotateLabels = 0, msr;

		var annotateCnt=0;
		jsGraphAnnotate[ctx.canvas.id]=new Array();

		if(config.annotateDisplay==true)
		{
			if(cursorDivCreated==false)oCursor=new makeCursorObj('divCursor');
			if(isIE() <9 && isIE()!= false)ctx.canvas.attachEvent("on"+config.annotateFunction,function(event){doMouseMove(ctx,config,event)});
			else ctx.canvas.addEventListener(config.annotateFunction,function(event){doMouseMove(ctx,config,event)},false);

		}

		clear(ctx);
		ctx.clearRect(0,0,width,height);

		valueBounds = getValueBounds();
		//Check and set the scale
		labelTemplateString = (config.scaleShowLabels)? config.scaleLabel : "";
		if (!config.scaleOverride){

			calculatedScale = calculateScale(valueBounds.maxSteps,valueBounds.minSteps,valueBounds.maxValue,valueBounds.minValue,labelTemplateString);
			msr=setMeasures(data,config,ctx,height,width,calculatedScale.labels,true,false,true,true);
		}
		else {
			calculatedScale = {
				steps : config.scaleSteps,
				stepValue : config.scaleStepWidth,
				graphMin : config.scaleStartValue,
				labels : []
			}
			for (var i=0; i<calculatedScale.steps; i++){
				if(labelTemplateString){
				calculatedScale.labels.push(tmpl(labelTemplateString,{value:1*((config.scaleStartValue + (config.scaleStepWidth * (i+1))).toFixed(getDecimalPlaces (config.scaleStepWidth)))}));
				}
			}
			msr=setMeasures(data,config,ctx,height,width,calculatedScale.labels,true,false,true,true);
		}


		msr.availableHeight=msr.availableHeight-config.scaleTickSizeBottom-config.scaleTickSizeTop;
		msr.availableWidth=msr.availableWidth-config.scaleTickSizeLeft-config.scaleTickSizeRight;

		scaleHop = Math.floor(msr.availableHeight/calculatedScale.steps);
		valueHop = Math.floor(msr.availableWidth/(data.labels.length));

		msr.availableWidth=(data.labels.length)*valueHop;
		msr.availableHeight=(calculatedScale.steps)*scaleHop;

		yAxisPosX=msr.leftNotUsableSize+config.scaleTickSizeLeft;
		xAxisPosY=msr.topNotUsableSize+msr.availableHeight+config.scaleTickSizeTop;

		barWidth = (valueHop - config.scaleGridLineWidth*2 - (config.barValueSpacing*2) - (config.barDatasetSpacing*data.datasets.length-1) - (config.barStrokeWidth/2)-1);


		animationLoop(config,drawScale,drawBars,ctx,msr.clrx,msr.clry,msr.clrwidth,msr.clrheight,yAxisPosX+msr.availableWidth/2,xAxisPosY-msr.availableHeight/2,yAxisPosX,xAxisPosY,data);

		function drawBars(animPc){
			ctx.lineWidth = config.barStrokeWidth;
			var yStart = new Array(data.datasets.length);

			var cumvalue=new Array();
			var totvalue=new Array();
			for (var i=0; i<data.datasets.length; i++){for (var j=0; j<data.datasets[i].data.length; j++){cumvalue[j]=0;totvalue[j]=0;} }
			for (var i=0; i<data.datasets.length; i++){for (var j=0; j<data.datasets[i].data.length; j++)totvalue[j]+=data.datasets[i].data[j];}


			for (var i=0; i<data.datasets.length; i++){
					ctx.fillStyle = data.datasets[i].fillColor;
					ctx.strokeStyle = data.datasets[i].strokeColor;
				if(animPc>=1)
				{
					 if(typeof(data.datasets[i].title)=="string")lgtxt=data.datasets[i].title.trim();
					 else lgtxt="";
				}
				if (i == 0) { //on the first pass, act as normal
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

						cumvalue[j] +=data.datasets[i].data[j];
						if(animPc>=1)
						{
							if(typeof(data.labels[j])=="string")lgtxt2=data.labels[j].trim();
							else lgtxt2="";
							jsGraphAnnotate[ctx.canvas.id][annotateCnt++]=["RECT",barOffset,xAxisPosY,barOffset+barWidth,xAxisPosY - calculateOffset(data.datasets[i].data[j],calculatedScale,scaleHop)+(config.barStrokeWidth/2),lgtxt,lgtxt2,data.datasets[i].data[j],cumvalue[j],totvalue[j],i,j];
						}
						yStart[j] = animPc*calculateOffset(data.datasets[i].data[j],calculatedScale,scaleHop)-(config.barStrokeWidth/2)


					}
				} else { //on all other passes, just build on top of the last set of data
					for (var j=0; j<data.datasets[i].data.length; j++){
						var barOffset = yAxisPosX + config.barValueSpacing + valueHop*j;
						ctx.beginPath();
						ctx.moveTo(barOffset, xAxisPosY - yStart[j] + 1);
						ctx.lineTo(barOffset, xAxisPosY - animPc*calculateOffset(calculatedScale.graphMin+data.datasets[i].data[j],calculatedScale,scaleHop)+(config.barStrokeWidth/2) - yStart[j]);
						ctx.lineTo(barOffset + barWidth, xAxisPosY - animPc*calculateOffset(calculatedScale.graphMin+data.datasets[i].data[j],calculatedScale,scaleHop)+(config.barStrokeWidth/2) - yStart[j]);
						ctx.lineTo(barOffset + barWidth, xAxisPosY - yStart[j] + 1);
						if(config.barShowStroke){
							ctx.stroke();
						}
						ctx.closePath();
						ctx.fill();

						cumvalue[j] +=data.datasets[i].data[j];
						if(animPc>=1)
						{
							if(typeof(data.labels[j])=="string")lgtxt2=data.labels[j].trim();
							else lgtxt2="";

							jsGraphAnnotate[ctx.canvas.id][annotateCnt++]=["RECT",barOffset,xAxisPosY - yStart[j] + 1,barOffset+barWidth,xAxisPosY - calculateOffset(calculatedScale.graphMin+data.datasets[i].data[j],calculatedScale,scaleHop)+(config.barStrokeWidth/2) - yStart[j],lgtxt,lgtxt2,data.datasets[i].data[j],cumvalue[j],totvalue[j],i,j];
						}
						yStart[j] += animPc*calculateOffset(calculatedScale.graphMin+data.datasets[i].data[j],calculatedScale,scaleHop)-(config.barStrokeWidth/2);

					}
				}
			}
		}

		function drawScale(){

			ctx.font = config.scaleFontStyle + " " + config.scaleFontSize+"px " + config.scaleFontFamily;


			//X axis line

			ctx.lineWidth = config.scaleLineWidth;
			ctx.strokeStyle = config.scaleLineColor;
			ctx.beginPath();
			ctx.moveTo(yAxisPosX-config.scaleTickSizeLeft,xAxisPosY);
			ctx.lineTo(yAxisPosX+msr.availableWidth+config.scaleTickSizeRight,xAxisPosY);

			ctx.stroke();


			if (msr.rotateLabels > 0){
				ctx.save();
				ctx.textAlign = "right";
			}
			else{
				ctx.textAlign = "center";
			}
			ctx.fillStyle = config.scaleFontColor;

			for (var i=0; i<data.labels.length; i++){
				ctx.save();
				if (msr.rotateLabels > 0){
					ctx.translate(yAxisPosX + i*valueHop,msr.xLabelPos);
					ctx.rotate(-(msr.rotateLabels * (Math.PI/180)));
					ctx.fillText(data.labels[i], 0,0);
				}
				else{
					ctx.fillText(data.labels[i], yAxisPosX + i*valueHop + (barWidth/2),msr.xLabelPos);
				}
				ctx.restore();

				ctx.beginPath();
				ctx.moveTo(yAxisPosX + i * valueHop, xAxisPosY+config.scaleTickSizeBottom);
				ctx.lineWidth = config.scaleGridLineWidth;
				ctx.strokeStyle = config.scaleGridLineColor;

				//Check i isnt 0, so we dont go over the Y axis twice.
				if(config.scaleShowGridLines && i>0){
					ctx.lineTo(yAxisPosX + i * valueHop, xAxisPosY-msr.availableHeight-config.scaleTickSizeTop );
				}
				else{
					ctx.lineTo(yAxisPosX + i * valueHop, xAxisPosY);
				}
				ctx.stroke();
			}

			//Y axis

			ctx.lineWidth = config.scaleLineWidth;
			ctx.strokeStyle = config.scaleLineColor;
			ctx.beginPath();
			ctx.moveTo(yAxisPosX,xAxisPosY+config.scaleTickSizeBottom);
			ctx.lineTo(yAxisPosX,xAxisPosY-msr.availableHeight-config.scaleTickSizeTop);
			ctx.stroke();

			ctx.textAlign = "right";
			ctx.textBaseline = "middle";
			for (var j=0; j<calculatedScale.steps; j++){
				ctx.beginPath();
				ctx.moveTo(yAxisPosX-config.scaleTickSizeLeft,xAxisPosY - ((j+1) * scaleHop));
				ctx.lineWidth = config.scaleGridLineWidth;
				ctx.strokeStyle = config.scaleGridLineColor;
				if (config.scaleShowGridLines){
					ctx.lineTo(yAxisPosX + msr.availableWidth + config.scaleTickSizeRight,xAxisPosY - ((j+1) * scaleHop));
				}
				else{
					ctx.lineTo(yAxisPosX ,xAxisPosY - ((j+1) * scaleHop));
				}

				ctx.stroke();

				if (config.scaleShowLabels){
					if(config.yAxisLeft) {
						ctx.textAlign = "right";
						ctx.fillText(calculatedScale.labels[j],yAxisPosX-(config.scaleTickSizeLeft+3),xAxisPosY - ((j+1) * scaleHop));
					}
					if(config.yAxisRight) {
						ctx.textAlign = "left";
						ctx.fillText(calculatedScale.labels[j],yAxisPosX + msr.availableWidth + (config.scaleTickSizeRight+3),xAxisPosY - ((j+1) * scaleHop));
					}
				}
			}


		}

		function getValueBounds() {
			var upperValue = Number.MIN_VALUE;
			var lowerValue = Number.MAX_VALUE;
			for (var i=0; i<data.datasets.length; i++){
				for (var j=0; j<data.datasets[i].data.length; j++){
					var k = i;
					var temp = data.datasets[0].data[j];
					while ( k > 0 ){ //get max of stacked data
						temp += data.datasets[k].data[j];
						k--;
					}
					if ( temp > upperValue) { upperValue = temp; };
					if ( temp < lowerValue) { lowerValue = temp; };
				}
			};

			// AJOUT CHANGEMENT
			if(!isNaN(config.graphMin) )lowerValue=config.graphMin;
			if(!isNaN(config.graphMax) )upperValue=config.graphMax;


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

	var HorizontalStackedBar = function(data,config,ctx){
		var maxSize, scaleHop, calculatedScale, labelHeight, scaleHeight, valueBounds, labelTemplateString, valueHop,widestXLabel, xAxisLength,yAxisPosX,xAxisPosY,barWidth, rotateLabels = 0, msr;

		var annotateCnt=0;
		jsGraphAnnotate[ctx.canvas.id]=new Array();

		if(config.annotateDisplay==true)
		{
			if(cursorDivCreated==false)oCursor=new makeCursorObj('divCursor');
			if(isIE() <9 && isIE()!= false)ctx.canvas.attachEvent("on"+config.annotateFunction,function(event){doMouseMove(ctx,config,event)});
			else ctx.canvas.addEventListener(config.annotateFunction,function(event){doMouseMove(ctx,config,event)},false);
		}

		clear(ctx);
		ctx.clearRect(0,0,width,height);


		valueBounds = getValueBounds();
		//Check and set the scale
		labelTemplateString = (config.scaleShowLabels)? config.scaleLabel : "";

		if (!config.scaleOverride){

			calculatedScale = calculateScale(valueBounds.maxSteps,valueBounds.minSteps,valueBounds.maxValue,valueBounds.minValue,labelTemplateString);
			msr=setMeasures(data,config,ctx,height,width,calculatedScale.labels,true,true,true,true);
		}
		else {
			calculatedScale = {
				steps : config.scaleSteps,
				stepValue : config.scaleStepWidth,
				graphMin : config.scaleStartValue,
				labels : []
			}


			for (var i=0; i<calculatedScale.steps; i++){
				if(labelTemplateString){
				calculatedScale.labels.push(tmpl(labelTemplateString,{value:1*((config.scaleStartValue + (config.scaleStepWidth * (i+1))).toFixed(getDecimalPlaces (config.scaleStepWidth)))}));
				}
			}
			msr=setMeasures(data,config,ctx,height,width,calculatedScale.labels,true,true,true,true);
		}

		msr.availableHeight=msr.availableHeight-config.scaleTickSizeBottom-config.scaleTickSizeTop;
		msr.availableWidth=msr.availableWidth-config.scaleTickSizeLeft-config.scaleTickSizeRight;

		scaleHop = Math.floor(msr.availableHeight/data.labels.length);
		valueHop = Math.floor(msr.availableWidth/(calculatedScale.steps));

		msr.availableWidth=(calculatedScale.steps)*valueHop;
		msr.availableHeight=(data.labels.length)*scaleHop;

		yAxisPosX=msr.leftNotUsableSize+config.scaleTickSizeLeft;
		xAxisPosY=msr.topNotUsableSize+msr.availableHeight+config.scaleTickSizeTop;

		barWidth = (scaleHop - config.scaleGridLineWidth*2 - (config.barValueSpacing*2) - (config.barDatasetSpacing*data.datasets.length-1) - (config.barStrokeWidth/2)-1);

		animationLoop(config,drawScale,drawBars,ctx,msr.clrx,msr.clry,msr.clrwidth,msr.clrheight,yAxisPosX+msr.availableWidth/2,xAxisPosY-msr.availableHeight/2,yAxisPosX,xAxisPosY,data);

	function HorizontalCalculateOffset(val,calculatedScale,scaleHop){

		var outerValue = calculatedScale.steps * calculatedScale.stepValue;
		var adjustedValue = val - calculatedScale.graphMin;
		var scalingFactor = CapValue(adjustedValue/outerValue,1,0);

		return (scaleHop*calculatedScale.steps) * scalingFactor;
	}

		function drawBars(animPc){
			ctx.lineWidth = config.barStrokeWidth;
			var yStart = new Array(data.datasets.length);

			var cumvalue=new Array();
			var totvalue=new Array();
			for (var i=0; i<data.datasets.length; i++){for (var j=0; j<data.datasets[i].data.length; j++){cumvalue[j]=0;totvalue[j]=0;} }
			for (var i=0; i<data.datasets.length; i++){for (var j=0; j<data.datasets[i].data.length; j++)totvalue[j]+=data.datasets[i].data[j];}

			for (var i=0; i<data.datasets.length; i++){
					ctx.fillStyle = data.datasets[i].fillColor;
					ctx.strokeStyle = data.datasets[i].strokeColor;
				if(animPc>=1)
				{
					 if(typeof(data.datasets[i].title)=="string")lgtxt=data.datasets[i].title.trim();
					 else lgtxt="";
				}
				if (i == 0) { //on the first pass, act as normal
					for (var j=0; j<data.datasets[i].data.length; j++){
						var barOffset = xAxisPosY + config.barValueSpacing - scaleHop*(j+1) ;
						ctx.beginPath();
						ctx.moveTo(yAxisPosX, barOffset);
						ctx.lineTo(yAxisPosX+animPc*HorizontalCalculateOffset(data.datasets[i].data[j],calculatedScale,valueHop)+(config.barStrokeWidth/2),barOffset);
						ctx.lineTo(yAxisPosX+animPc*HorizontalCalculateOffset(data.datasets[i].data[j],calculatedScale,valueHop)+(config.barStrokeWidth/2),barOffset+barWidth);
						ctx.lineTo(yAxisPosX, barOffset+barWidth);

						if(config.barShowStroke){
							ctx.stroke();
						}
						ctx.closePath();
						ctx.fill();

						cumvalue[j] +=data.datasets[i].data[j];
						if(animPc>=1)
						{
							if(typeof(data.labels[j])=="string")lgtxt2=data.labels[j].trim();
							else lgtxt2="";
							jsGraphAnnotate[ctx.canvas.id][annotateCnt++]=["RECT",yAxisPosX,barOffset+barWidth,yAxisPosX+HorizontalCalculateOffset(data.datasets[i].data[j],calculatedScale,valueHop)+(config.barStrokeWidth/2),barOffset,lgtxt,lgtxt2,data.datasets[i].data[j],cumvalue[j],totvalue[j],i,j];
						}
						yStart[j] = animPc*HorizontalCalculateOffset(data.datasets[i].data[j],calculatedScale,valueHop)+(config.barStrokeWidth/2);


					}
				} else { //on all other passes, just build on top of the last set of data
					for (var j=0; j<data.datasets[i].data.length; j++){

						var barOffset = xAxisPosY + config.barValueSpacing - scaleHop*(j+1);
						ctx.beginPath();
						ctx.moveTo(barOffset, xAxisPosY - yStart[j] + 1);

						ctx.moveTo(yAxisPosX+yStart[j]+1, barOffset);
						ctx.lineTo(yAxisPosX+yStart[j]+animPc*HorizontalCalculateOffset(calculatedScale.graphMin+data.datasets[i].data[j],calculatedScale,valueHop)+(config.barStrokeWidth/2),barOffset);
						ctx.lineTo(yAxisPosX+yStart[j]+animPc*HorizontalCalculateOffset(calculatedScale.graphMin+data.datasets[i].data[j],calculatedScale,valueHop)+(config.barStrokeWidth/2),barOffset+barWidth);
						ctx.lineTo(yAxisPosX+yStart[j]+1, barOffset+barWidth);


						if(config.barShowStroke){
							ctx.stroke();
						}
						ctx.closePath();
						ctx.fill();

						cumvalue[j] +=data.datasets[i].data[j];
						if(animPc>=1)
						{
							if(typeof(data.labels[j])=="string")lgtxt2=data.labels[j].trim();
							else lgtxt2="";
							jsGraphAnnotate[ctx.canvas.id][annotateCnt++]=["RECT",yAxisPosX+yStart[j]+1,barOffset+barWidth,yAxisPosX+yStart[j]+HorizontalCalculateOffset(calculatedScale.graphMin+data.datasets[i].data[j],calculatedScale,valueHop)+(config.barStrokeWidth/2),barOffset,lgtxt,lgtxt2,data.datasets[i].data[j],cumvalue[j],totvalue[j],i,j];
						}
						yStart[j] += animPc*HorizontalCalculateOffset(calculatedScale.graphMin+data.datasets[i].data[j],calculatedScale,valueHop)+(config.barStrokeWidth/2);


					}
				}
			}
		}

		function drawScale(){

			ctx.font = config.scaleFontStyle + " " + config.scaleFontSize+"px " + config.scaleFontFamily;


			//X axis line

			ctx.lineWidth = config.scaleLineWidth;
			ctx.strokeStyle = config.scaleLineColor;
			ctx.beginPath();
			ctx.moveTo(yAxisPosX-config.scaleTickSizeLeft,xAxisPosY);
			ctx.lineTo(yAxisPosX+msr.availableWidth,xAxisPosY);

			ctx.stroke();


			if (msr.rotateLabels > 0){
				ctx.save();
				ctx.textAlign = "right";
			}
			else{
				ctx.textAlign = "center";
			}
			ctx.fillStyle = config.scaleFontColor;

			for (var i=0; i<calculatedScale.steps; i++){
				ctx.save();
				if (msr.rotateLabels > 0){
					ctx.translate(yAxisPosX + (i+1)*valueHop,msr.xLabelPos);
					ctx.rotate(-(msr.rotateLabels * (Math.PI/180)));
					ctx.fillText(calculatedScale.labels[i], 0,0);
				}
				else{
					ctx.fillText(calculatedScale.labels[i], yAxisPosX + ((i+1) * valueHop),msr.xLabelPos);
				}
				ctx.restore();

				ctx.beginPath();
				ctx.moveTo(yAxisPosX + i * valueHop, xAxisPosY+config.scaleTickSizeBottom);
				ctx.lineWidth = config.scaleGridLineWidth;
				ctx.strokeStyle = config.scaleGridLineColor;

				//Check i isnt 0, so we dont go over the Y axis twice.
				if(config.scaleShowGridLines && i>0){
					ctx.lineTo(yAxisPosX + i * valueHop, xAxisPosY-msr.availableHeight-config.scaleTickSizeTop );
				}
				else{
					ctx.lineTo(yAxisPosX + i * valueHop, xAxisPosY);
				}
				ctx.stroke();
			}

			//Y axis

			ctx.lineWidth = config.scaleLineWidth;
			ctx.strokeStyle = config.scaleLineColor;
			ctx.beginPath();
			ctx.moveTo(yAxisPosX,xAxisPosY+config.scaleTickSizeBottom);
			ctx.lineTo(yAxisPosX,xAxisPosY-msr.availableHeight-config.scaleTickSizeTop);
			ctx.stroke();

			ctx.textAlign = "right";
			ctx.textBaseline = "middle";
			for (var j=0; j<data.labels.length; j++){

				ctx.beginPath();
				ctx.moveTo(yAxisPosX-config.scaleTickSizeLeft,xAxisPosY - ((j+1) * scaleHop));
				ctx.lineWidth = config.scaleGridLineWidth;
				ctx.strokeStyle = config.scaleGridLineColor;
				if (config.scaleShowGridLines){
					ctx.lineTo(yAxisPosX + msr.availableWidth ,xAxisPosY - ((j+1) * scaleHop));
				}
				else{
					ctx.lineTo(yAxisPosX ,xAxisPosY - ((j+1) * scaleHop));
				}

				ctx.stroke();

				if (config.scaleShowLabels){
					if(config.yAxisLeft) {
						ctx.textAlign = "right";
						ctx.fillText(data.labels[j],yAxisPosX-(config.scaleTickSizeLeft+3),xAxisPosY - ((j+1) * scaleHop)+ barWidth/2);
					}
					if(config.yAxisRight) {
						ctx.textAlign = "left";
						ctx.fillText(data.labels[j],yAxisPosX + msr.availableWidth + (config.scaleTickSizeRight+3),xAxisPosY - ((j+1) * scaleHop)+ barWidth/2);
					}
				}
			}


		}



		function getValueBounds() {
			var upperValue = Number.MIN_VALUE;
			var lowerValue = Number.MAX_VALUE;
			for (var i=0; i<data.datasets.length; i++){
				for (var j=0; j<data.datasets[i].data.length; j++){
					var k = i;
					var temp = data.datasets[0].data[j];
					while ( k > 0 ){ //get max of stacked data
						temp += data.datasets[k].data[j];
						k--;
					}
					if ( temp > upperValue) { upperValue = temp; };
					if ( temp < lowerValue) { lowerValue = temp; };
				}
			};

			// AJOUT CHANGEMENT
			if(!isNaN(config.graphMin) )lowerValue=config.graphMin;
			if(!isNaN(config.graphMax) )upperValue=config.graphMax;


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
		var maxSize, scaleHop, calculatedScale, labelHeight, scaleHeight, valueBounds, labelTemplateString, valueHop,widestXLabel, xAxisLength,yAxisPosX,xAxisPosY,barWidth, rotateLabels = 0, msr;

		var annotateCnt=0;
		jsGraphAnnotate[ctx.canvas.id]=new Array();

		if(config.annotateDisplay==true)
		{
			if(cursorDivCreated==false)oCursor=new makeCursorObj('divCursor');
			if(isIE() <9 && isIE()!= false)ctx.canvas.attachEvent("on"+config.annotateFunction,function(event){doMouseMove(ctx,config,event)});
			else ctx.canvas.addEventListener(config.annotateFunction,function(event){doMouseMove(ctx,config,event)},false);

		}
		clear(ctx);
		ctx.clearRect(0,0,width,height);


		valueBounds = getValueBounds();
		//Check and set the scale
		labelTemplateString = (config.scaleShowLabels)? config.scaleLabel : "";

		if (!config.scaleOverride){

			calculatedScale = calculateScale(valueBounds.maxSteps,valueBounds.minSteps,valueBounds.maxValue,valueBounds.minValue,labelTemplateString);
			msr=setMeasures(data,config,ctx,height,width,calculatedScale.labels,true,false,true,true);
		}
		else {
			calculatedScale = {
				steps : config.scaleSteps,
				stepValue : config.scaleStepWidth,
				graphMin : config.scaleStartValue,
				labels : []
			}
			populateLabels(labelTemplateString, calculatedScale.labels,calculatedScale.steps,config.scaleStartValue,config.scaleStepWidth);
			msr=setMeasures(data,config,ctx,height,width,calculatedScale.labels,true,false,true,true);
		}



		msr.availableHeight=msr.availableHeight-config.scaleTickSizeBottom-config.scaleTickSizeTop;
		msr.availableWidth=msr.availableWidth-config.scaleTickSizeLeft-config.scaleTickSizeRight;

		scaleHop = Math.floor(msr.availableHeight/calculatedScale.steps);
		valueHop = Math.floor(msr.availableWidth/(data.labels.length));

		msr.availableWidth=(data.labels.length)*valueHop;
		msr.availableHeight=(calculatedScale.steps)*scaleHop;

		yAxisPosX=msr.leftNotUsableSize+config.scaleTickSizeLeft;
		xAxisPosY=msr.topNotUsableSize+msr.availableHeight+config.scaleTickSizeTop;

		barWidth = (valueHop - config.scaleGridLineWidth*2 - (config.barValueSpacing*2) - (config.barDatasetSpacing*data.datasets.length-1) - ((config.barStrokeWidth/2)*data.datasets.length-1))/data.datasets.length;

		animationLoop(config,drawScale,drawBars,ctx,msr.clrx,msr.clry,msr.clrwidth,msr.clrheight,yAxisPosX+msr.availableWidth/2,xAxisPosY-msr.availableHeight/2,yAxisPosX,xAxisPosY,data);

		function drawBars(animPc){


			var cumvalue=new Array();
			var totvalue=new Array();
			for (var i=0; i<data.datasets.length; i++){for (var j=0; j<data.datasets[i].data.length; j++){cumvalue[j]=0;totvalue[j]=0;} }
			for (var i=0; i<data.datasets.length; i++){for (var j=0; j<data.datasets[i].data.length; j++)totvalue[j]+=data.datasets[i].data[j];}

			ctx.lineWidth = config.barStrokeWidth;
			for (var i=0; i<data.datasets.length; i++){
				ctx.fillStyle = data.datasets[i].fillColor;
				ctx.strokeStyle = data.datasets[i].strokeColor;
				if(animPc>=1)
				{
						if(typeof(data.datasets[i].title)=="string")lgtxt=data.datasets[i].title.trim();
						else lgtxt="";
				}
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

					cumvalue[j] +=data.datasets[i].data[j];
					if(animPc>=1)
					{
							if(typeof(data.labels[j])=="string")lgtxt2=data.labels[j].trim();
							else lgtxt2="";
							jsGraphAnnotate[ctx.canvas.id][annotateCnt++]=["RECT",barOffset,xAxisPosY,barOffset + barWidth,xAxisPosY - calculateOffset(data.datasets[i].data[j],calculatedScale,scaleHop)+(config.barStrokeWidth/2),lgtxt,lgtxt2,data.datasets[i].data[j],cumvalue[j],totvalue[j],i,j];
					}
				}
			}

		}

		function drawScale(){

			ctx.font = config.scaleFontStyle + " " + config.scaleFontSize+"px " + config.scaleFontFamily;


			//X axis line

			ctx.lineWidth = config.scaleLineWidth;
			ctx.strokeStyle = config.scaleLineColor;
			ctx.beginPath();
			ctx.moveTo(yAxisPosX-config.scaleTickSizeLeft,xAxisPosY);
			ctx.lineTo(yAxisPosX+msr.availableWidth+config.scaleTickSizeRight,xAxisPosY);

			ctx.stroke();


			if (msr.rotateLabels > 0){
				ctx.save();
				ctx.textAlign = "right";
			}
			else{
				ctx.textAlign = "center";
			}
			ctx.fillStyle = config.scaleFontColor;

			for (var i=0; i<data.labels.length; i++){
				ctx.save();
				if (msr.rotateLabels > 0){
					ctx.translate(yAxisPosX + i*valueHop+(valueHop/2),msr.xLabelPos);
					ctx.rotate(-(msr.rotateLabels * (Math.PI/180)));
					ctx.fillText(data.labels[i], 0,0);
				}
				else{
					ctx.fillText(data.labels[i], yAxisPosX + i*valueHop + (valueHop/2),msr.xLabelPos);
				}
				ctx.restore();

				ctx.beginPath();
				ctx.moveTo(yAxisPosX + i * valueHop, xAxisPosY+config.scaleTickSizeBottom);
				ctx.lineWidth = config.scaleGridLineWidth;
				ctx.strokeStyle = config.scaleGridLineColor;

				//Check i isnt 0, so we dont go over the Y axis twice.
				if(config.scaleShowGridLines && i>0){
					ctx.lineTo(yAxisPosX + i * valueHop, xAxisPosY-msr.availableHeight-config.scaleTickSizeTop );
				}
				else{
					ctx.lineTo(yAxisPosX + i * valueHop, xAxisPosY);
				}
				ctx.stroke();
			}

			//Y axis

			ctx.lineWidth = config.scaleLineWidth;
			ctx.strokeStyle = config.scaleLineColor;
			ctx.beginPath();
			ctx.moveTo(yAxisPosX,xAxisPosY+config.scaleTickSizeBottom);
			ctx.lineTo(yAxisPosX,xAxisPosY-msr.availableHeight-config.scaleTickSizeTop);
			ctx.stroke();

			ctx.textAlign = "right";
			ctx.textBaseline = "middle";
			for (var j=0; j<calculatedScale.steps; j++){
				ctx.beginPath();
				ctx.moveTo(yAxisPosX-config.scaleTickSizeLeft,xAxisPosY - ((j+1) * scaleHop));
				ctx.lineWidth = config.scaleGridLineWidth;
				ctx.strokeStyle = config.scaleGridLineColor;
				if (config.scaleShowGridLines){
					ctx.lineTo(yAxisPosX + msr.availableWidth + config.scaleTickSizeRight,xAxisPosY - ((j+1) * scaleHop));
				}
				else{
					ctx.lineTo(yAxisPosX ,xAxisPosY - ((j+1) * scaleHop));
				}

				ctx.stroke();

				if (config.scaleShowLabels){
					if(config.yAxisLeft) {
						ctx.textAlign = "right";
						ctx.fillText(calculatedScale.labels[j],yAxisPosX-(config.scaleTickSizeLeft+3),xAxisPosY - ((j+1) * scaleHop));
					}
					if(config.yAxisRight) {
						ctx.textAlign = "left";
						ctx.fillText(calculatedScale.labels[j],yAxisPosX + msr.availableWidth + (config.scaleTickSizeRight+3),xAxisPosY - ((j+1) * scaleHop));
					}
				}
			}


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

			// AJOUT CHANGEMENT
			if(!isNaN(config.graphMin) )lowerValue=config.graphMin;
			if(!isNaN(config.graphMax) )upperValue=config.graphMax;

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

	var HorizontalBar = function(data,config,ctx){
		var maxSize, scaleHop, calculatedScale, labelHeight, scaleHeight, valueBounds, labelTemplateString, valueHop,widestXLabel, xAxisLength,yAxisPosX,xAxisPosY,barWidth, rotateLabels = 0, msr;

		var annotateCnt=0;
		jsGraphAnnotate[ctx.canvas.id]=new Array();

		if(config.annotateDisplay==true)
		{
			if(cursorDivCreated==false)oCursor=new makeCursorObj('divCursor');
			if(isIE() <9 && isIE()!= false)ctx.canvas.attachEvent("on"+config.annotateFunction,function(event){doMouseMove(ctx,config,event)});
			else ctx.canvas.addEventListener(config.annotateFunction,function(event){doMouseMove(ctx,config,event)},false);
		}
		clear(ctx);
		ctx.clearRect(0,0,width,height);

		valueBounds = getValueBounds();
		//Check and set the scale
		labelTemplateString = (config.scaleShowLabels)? config.scaleLabel : "";

		if (!config.scaleOverride){

			calculatedScale = calculateScale(valueBounds.maxSteps,valueBounds.minSteps,valueBounds.maxValue,valueBounds.minValue,labelTemplateString);
			msr=setMeasures(data,config,ctx,height,width,calculatedScale.labels,true,true,true,true);
		}
		else {
			calculatedScale = {
				steps : config.scaleSteps,
				stepValue : config.scaleStepWidth,
				graphMin : config.scaleStartValue,
				labels : []
			}
			populateLabels(labelTemplateString, calculatedScale.labels,calculatedScale.steps,config.scaleStartValue,config.scaleStepWidth);
			msr=setMeasures(data,config,ctx,height,width,calculatedScale.labels,true,true,true,true);
		}

		msr.availableHeight=msr.availableHeight-config.scaleTickSizeBottom-config.scaleTickSizeTop;
		msr.availableWidth=msr.availableWidth-config.scaleTickSizeLeft-config.scaleTickSizeRight;

		scaleHop = Math.floor(msr.availableHeight/data.labels.length);
		valueHop = Math.floor(msr.availableWidth/(calculatedScale.steps));

		msr.availableWidth=(calculatedScale.steps)*valueHop;
		msr.availableHeight=(data.labels.length)*scaleHop;

		yAxisPosX=msr.leftNotUsableSize+config.scaleTickSizeLeft;
		xAxisPosY=msr.topNotUsableSize+msr.availableHeight+config.scaleTickSizeTop;

		barWidth = (scaleHop - config.scaleGridLineWidth*2 - (config.barValueSpacing*2) - (config.barDatasetSpacing*data.datasets.length-1) - ((config.barStrokeWidth/2)*data.datasets.length-1))/data.datasets.length;

		animationLoop(config,drawScale,drawBars,ctx,msr.clrx,msr.clry,msr.clrwidth,msr.clrheight,yAxisPosX+msr.availableWidth/2,xAxisPosY-msr.availableHeight/2,yAxisPosX,xAxisPosY,data);

		function drawBars(animPc){

			var cumvalue=new Array();
			var totvalue=new Array();
			for (var i=0; i<data.datasets.length; i++){for (var j=0; j<data.datasets[i].data.length; j++){cumvalue[j]=0;totvalue[j]=0;} }
			for (var i=0; i<data.datasets.length; i++){for (var j=0; j<data.datasets[i].data.length; j++)totvalue[j]+=data.datasets[i].data[j];}

			ctx.lineWidth = config.barStrokeWidth;
			for (var i=0; i<data.datasets.length; i++){
					ctx.fillStyle = data.datasets[i].fillColor;
					ctx.strokeStyle = data.datasets[i].strokeColor;
				if(animPc>=1)
				{
					 if(typeof(data.datasets[i].title)=="string")lgtxt=data.datasets[i].title.trim();
					 else lgtxt="";
				}
				for (var j=0; j<data.datasets[i].data.length; j++){
						var barOffset = xAxisPosY + config.barValueSpacing - scaleHop*(j+1) + barWidth*i + config.barDatasetSpacing*i + config.barStrokeWidth*i ;
						ctx.beginPath();
						ctx.moveTo(yAxisPosX, barOffset);
						ctx.lineTo(yAxisPosX+animPc*calculateOffset(data.datasets[i].data[j],calculatedScale,valueHop)+(config.barStrokeWidth/2),barOffset);
						ctx.lineTo(yAxisPosX+animPc*calculateOffset(data.datasets[i].data[j],calculatedScale,valueHop)+(config.barStrokeWidth/2),barOffset+barWidth);
						ctx.lineTo(yAxisPosX, barOffset+barWidth);

					if(config.barShowStroke){
						ctx.stroke();
					}
					ctx.closePath();
					ctx.fill();

					cumvalue[j] +=data.datasets[i].data[j];
					if(animPc>=1)
					{
							if(typeof(data.labels[j])=="string")lgtxt2=data.labels[j].trim();
							else lgtxt2="";
							jsGraphAnnotate[ctx.canvas.id][annotateCnt++]=["RECT",yAxisPosX,barOffset+barWidth,yAxisPosX+calculateOffset(data.datasets[i].data[j],calculatedScale,valueHop)+(config.barStrokeWidth/2),barOffset,lgtxt,lgtxt2,data.datasets[i].data[j],cumvalue[j],totvalue[j],i,j];
					}
				}
			}

		}

		function drawScale(){

			ctx.font = config.scaleFontStyle + " " + config.scaleFontSize+"px " + config.scaleFontFamily;


			//X axis line


			ctx.lineWidth = config.scaleLineWidth;
			ctx.strokeStyle = config.scaleLineColor;
			ctx.beginPath();
			ctx.moveTo(yAxisPosX-config.scaleTickSizeLeft,xAxisPosY);
			ctx.lineTo(yAxisPosX+msr.availableWidth+config.scaleTickSizeRight,xAxisPosY);

			ctx.stroke();


			if (msr.rotateLabels > 0){
				ctx.save();
				ctx.textAlign = "right";
			}
			else{
				ctx.textAlign = "center";
			}
			ctx.fillStyle = config.scaleFontColor;

			for (var i=0; i<calculatedScale.steps; i++){

				ctx.save();
				if (msr.rotateLabels > 0){
					ctx.translate(yAxisPosX + (i+1)*valueHop+(valueHop/2),msr.xLabelPos);
					ctx.rotate(-(msr.rotateLabels * (Math.PI/180)));
					ctx.fillText(calculatedScale.labels[i], 0,0);
				}
				else{
					ctx.fillText(calculatedScale.labels[i], yAxisPosX + (i+1)*valueHop ,msr.xLabelPos);
				}
				ctx.restore();

				ctx.beginPath();
				ctx.moveTo(yAxisPosX + i * valueHop, xAxisPosY+config.scaleTickSizeBottom);
				ctx.lineWidth = config.scaleGridLineWidth;
				ctx.strokeStyle = config.scaleGridLineColor;

				//Check i isnt 0, so we dont go over the Y axis twice.
				if(config.scaleShowGridLines && i>0){
					ctx.lineTo(yAxisPosX + i * valueHop, xAxisPosY-msr.availableHeight-config.scaleTickSizeTop );
				}
				else{
					ctx.lineTo(yAxisPosX + i * valueHop, xAxisPosY);
				}
				ctx.stroke();
			}

			//Y axis

			ctx.lineWidth = config.scaleLineWidth;
			ctx.strokeStyle = config.scaleLineColor;
			ctx.beginPath();
			ctx.moveTo(yAxisPosX,xAxisPosY+config.scaleTickSizeBottom);
			ctx.lineTo(yAxisPosX,xAxisPosY-msr.availableHeight-config.scaleTickSizeTop);
			ctx.stroke();

			ctx.textAlign = "right";
			ctx.textBaseline = "middle";
			for (var j=0; j<data.labels.length; j++){
				ctx.beginPath();
				ctx.moveTo(yAxisPosX-config.scaleTickSizeLeft,xAxisPosY - ((j+1) * scaleHop));
				ctx.lineWidth = config.scaleGridLineWidth;
				ctx.strokeStyle = config.scaleGridLineColor;
				if (config.scaleShowGridLines){
					ctx.lineTo(yAxisPosX + msr.availableWidth + config.scaleTickSizeRight,xAxisPosY - ((j+1) * scaleHop));
				}
				else{
					ctx.lineTo(yAxisPosX ,xAxisPosY - ((j+1) * scaleHop));
				}

				ctx.stroke();

				if (config.scaleShowLabels){
					if(config.yAxisLeft) {
						ctx.textAlign = "right";
						ctx.fillText(data.labels[j],yAxisPosX-(config.scaleTickSizeLeft+3),xAxisPosY - (j * scaleHop)-scaleHop/2);
					}
					if(config.yAxisRight) {
						ctx.textAlign = "left";
						ctx.fillText(data.labels[j],yAxisPosX + msr.availableWidth + (config.scaleTickSizeRight+3),xAxisPosY - (j * scaleHop)-scaleHop/2);
					}
				}
			}


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

			// AJOUT CHANGEMENT
			if(!isNaN(config.graphMin) )lowerValue=config.graphMin;
			if(!isNaN(config.graphMax) )upperValue=config.graphMax;


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

	function animationLoop(config,drawScale,drawData,ctx,clrx,clry,clrwidth,clrheight,midPosX,midPosY,borderX,borderY,data){

		if(isIE() <9 && isIE()!= false)config.animation=false;

		var animFrameAmount = (config.animation)? 1/CapValue(config.animationSteps,Number.MAX_VALUE,1) : 1,
			easingFunction = animationOptions[config.animationEasing],
			percentAnimComplete =(config.animation)? 0 : 1;



		if (typeof drawScale !== "function") drawScale = function(){};

		requestAnimFrame(animLoop);

		function animateFrame(){
			var easeAdjustedAnimationPercent =(config.animation)? CapValue(easingFunction(percentAnimComplete),null,0) : 1;

			if(!(isIE() <9 && isIE()!= false))ctx.clearRect(clrx,clry,clrwidth,clrheight);

			dispCrossText(ctx,config,midPosX,midPosY,borderX,borderY,false,data,easeAdjustedAnimationPercent);

			if(config.scaleOverlay){
				drawData(easeAdjustedAnimationPercent);
				drawScale();
			} else {
				drawScale();
				drawData(easeAdjustedAnimationPercent);
			}
			dispCrossText(ctx,config,midPosX,midPosY,borderX,borderY,true,data,easeAdjustedAnimationPercent);
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

	function calculateScale(maxSteps,minSteps,maxValue,minValue,labelTemplateString){

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
					};

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
								labels.push(tmpl(labelTemplateString, {value: (1*(graphMin + (stepValue * i)).toFixed(getDecimalPlaces(stepValue)))}));
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
			for (var attrname in userDefined) { returnObj[attrname] = userDefined[attrname]; }
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

		function dispCrossText(ctx,config,posX,posY,borderX,borderY,overlay,data,animPC)
		{
				var i,disptxt,txtposx,txtposy,txtAlign,txtBaseline;

				for(i=0;i<config.crossText.length;i++)
				{
					if(config.crossText[i]!="" && config.crossTextOverlay[ Min ([i,config.crossTextOverlay.length-1 ])]==overlay)
					{
						ctx.save();
						ctx.beginPath();
						ctx.font = config.crossTextFontStyle[ Min ([i,config.crossTextFontStyle.length-1 ])] +" "+ config.crossTextFontSize[ Min ([i,config.crossTextFontSize.length-1 ])]+"px "+config.crossTextFontFamily[ Min ([i,config.crossTextFontFamily.length-1 ])];
						ctx.fillStyle = config.crossTextFontColor[ Min ([i,config.crossTextFontColor.length-1 ])];

						textAlign = config.crossTextAlign[ Min ([i,config.crossTextAlign.length-1 ])];
						textBaseline=config.crossTextBaseline[ Min ([i,config.crossTextBaseline.length-1 ])];

						txtposx= 1*config.crossTextPosX[ Min ([i,config.crossTextPosX.length-1 ])];
						txtposy= 1*config.crossTextPosY[ Min ([i,config.crossTextPosY.length-1 ])];

						switch (1*config.crossTextRelativePosX[ Min ([i,config.crossTextRelativePosX.length-1 ])])
						{
							case 0:
								if (textAlign=="default")textAlign="left";
								break;
							case 1:
								txtposx+=borderX;
								if (textAlign=="default")textAlign="right";
								break;
							case 2:
								txtposx+=posX;
								if (textAlign=="default")textAlign="center";
								break;
							case -2:
								txtposx+=context.canvas.width/2;
								if (textAlign=="default")textAlign="center";
								break;
							case 3:
								txtposx+=txtposx+2*posX-borderX;
								if (textAlign=="default")textAlign="left";
								break;
							case 4:
								// posX=width;
								txtposx+=context.canvas.width;
								if (textAlign=="default")textAlign="right";
								break;
							default:
								txtposx+=posX;
								if (textAlign=="default")textAlign="center";
								break;
						}

						switch (1*config.crossTextRelativePosY[ Min ([i,config.crossTextRelativePosY.length-1 ])])
						{
							case 0:
								if (textBaseline=="default")textBaseline="top";
								break;
							case 3:
								txtposy+=borderY;
								if (textBaseline=="default")textBaseline="top";
								break;
							case 2:
								txtposy+=posY;
								if (textBaseline=="default")textBaseline="middle";
								break;
							case -2:
								txtposy+=context.canvas.height/2;
								if (textBaseline=="default")textBaseline="middle";
								break;
							case 1:
								txtposy+=txtposy+2*posY-borderY;
								if (textBaseline=="default")textBaseline="bottom";
								break;
							case 4:
								txtposy+=context.canvas.height;
								if (textBaseline=="default")textBaseline="bottom";
								break;
							default:
								txtposy+=posY;
								if (textBaseline=="default")textBaseline="middle";
								break;
						}


						ctx.textAlign=textAlign;
						ctx.textBaseline=textBaseline;

						ctx.translate(1*txtposx,1*txtposy);

						ctx.rotate(config.crossTextAngle[ Min ([i,config.crossTextAngle.length-1 ])]);

						if(config.crossText[i].substring(0,1)=="%")
						{
							if (typeof config.crossTextFunction == "function") disptxt=config.crossTextFunction(i,config.crossText[i],ctx,config,posX,posY,borderX,borderY,overlay,data,animPC);
						}
						else disptxt=config.crossText[i];

						ctx.fillText(disptxt, 0,0);
						ctx.stroke();
						ctx.restore();
					}
				}


		}

	 //****************************************************************************************
	 function setMeasures(data,config,ctx,height,width,ylabels,reverseLegend,reverseAxis,drawAxis,drawLegendOnData){

			spaceBefore=5;
			spaceAfter=5;
			spaceLeft=5;
			spaceRight=5;

			borderWidth=0;

			yAxisLabelWidth=0;
			yAxisLabelPos=0;

			yLabelsWidth=0;


			graphTitleHeight=0;
			graphTitlePosY=0;

			graphSubTitleHeight=0;
			graphSubTitlePosY=0;

			footNoteHeight=0;
			footNotePosY=0;

			yAxisUnitHeight=0;
			yAxisUnitPosY=0;

			widestLegend=0;
			nbeltLegend=0;
			nbLegendLines=0;
			nbLegendCols=0;
			spaceLegendHeight=0;
			xFirstLegendTextPos=0;
			yFirstLegendTextPos=0;
			xLegendBorderPos=0;
			yLegendBorderPos=0;

			yAxisLabelWidth=0;
			yAxisLabelPos=0;

			xAxisLabelHeight=0;
			xLabelHeight=0;

			widestXLabel=1;

			leftNotUsableSize=0;
			rightNotUsableSize=0;

			rotateLabels=0;
			xLabelPos=0;



			// Borders

			if(typeof(config.canvasBorders)!= "undefined"){
				if(config.canvasBorders) borderWidth= config.canvasBordersWidth;
			}

			// compute widest X label


			if(drawAxis) {
				 ctx.font = config.scaleFontStyle + " " + config.scaleFontSize+"px " + config.scaleFontFamily;
				 for (var i=0; i<data.labels.length; i++){
						var textLength = ctx.measureText(data.labels[i]).width;
						//If the text length is longer - make that equal to longest text!
						widestXLabel = (textLength > widestXLabel)? textLength : widestXLabel;
				 }
			}

			// compute Y Label Width

			widestYLabel=1;


			if(drawAxis) {

				if(ylabels != null){
					ctx.font = config.scaleFontStyle + " " + config.scaleFontSize+"px " + config.scaleFontFamily;
					for (var i=ylabels.length-1;i>=0; i--){
							if(typeof(ylabels[i])=="string"){
								if(ylabels[i].trim() != ""){
									var textLength = ctx.measureText(ylabels[i]).width;
									//If the text length is longer - make that equal to longest text!
									widestYLabel = (textLength > widestYLabel)? textLength : widestYLabel;
								}
							}
					}



					if(reverseAxis==false)  yLabelsWidth=widestYLabel+spaceLeft+spaceRight;
					else yLabelsWidth=widestXLabel+spaceLeft+spaceRight;

				}
			}

			// yAxisLabel
			leftNotUsableSize=borderWidth+config.spaceLeft
			rightNotUsableSize=borderWidth+config.spaceRight;


			if(drawAxis) {

				if(typeof(config.yAxisLabel)!= "undefined"){
					if(config.yAxisLabel.trim() != "")
					{
						yAxisLabelWidth= (config.yAxisFontSize+spaceBefore+spaceAfter);
						yAxisLabelPosLeft= borderWidth+config.spaceLeft+spaceBefore+config.yAxisFontSize;
						yAxisLabelPosRight= width-config.spaceRight-borderWidth-spaceAfter-config.yAxisFontSize;
					}
				}

				if(config.yAxisLeft){
					if(reverseAxis==false)leftNotUsableSize=borderWidth+config.spaceLeft+yAxisLabelWidth+widestYLabel+spaceBefore+spaceAfter;
					else                  leftNotUsableSize=borderWidth+config.spaceLeft+yAxisLabelWidth+widestXLabel+spaceBefore+spaceAfter;
				}


				if(config.yAxisRight){
					if(reverseAxis==false)rightNotUsableSize=borderWidth+config.spaceRight+yAxisLabelWidth+widestYLabel+spaceBefore+spaceAfter;
					else                  rightNotUsableSize=borderWidth+config.spaceRight+yAxisLabelWidth+widestXLabel+spaceBefore+spaceAfter;
				}

			}


			availableWidth=width-leftNotUsableSize-rightNotUsableSize;

			// Title

			if(typeof(config.graphTitle)!= "undefined"){
				if(config.graphTitle.trim() != ""){
						graphTitleHeight = (config.graphTitleFontSize+spaceBefore+spaceAfter);
						graphTitlePosY=borderWidth+config.spaceTop+graphTitleHeight-spaceAfter;
				}
			}

			// subTitle

			if(config.graphSubTitle.trim() != ""){
					graphSubTitleHeight = (config.graphSubTitleFontSize+spaceBefore+spaceAfter);
					graphSubTitlePosY=borderWidth+config.spaceTop+graphTitleHeight+graphSubTitleHeight-spaceAfter;
			}

			// yAxisUnit

			if(drawAxis) {

				if(typeof(config.yAxisUnit)!= "undefined"){
					if(config.yAxisUnit.trim() != ""){
						yAxisUnitHeight = (config.yAxisUnitFontSize+spaceBefore+spaceAfter);
						yAxisUnitPosY=borderWidth+config.spaceTop+graphTitleHeight+graphSubTitleHeight+yAxisUnitHeight-spaceAfter;
					}
				}
			}


			topNotUsableSize=borderWidth+config.spaceTop+graphTitleHeight+graphSubTitleHeight+yAxisUnitHeight+spaceAfter;

			// footNote

			if(typeof(config.footNote)!= "undefined"){
				if(config.footNote.trim() != "")
				{
					footNoteHeight= (config.footNoteFontSize+spaceBefore+spaceAfter);
					footNotePosY= height - config.spaceBottom - borderWidth-spaceAfter;
				}
			}

			// remove space for Legend
			if(typeof(config.legend)!= "undefined"){
				if(config.legend==true){
					ctx.font = config.legendFontStyle + " " + config.legendFontSize+"px " + config.legendFontFamily;
					if(drawLegendOnData)
					{
						for (var i=data.datasets.length-1;i>=0; i--){
							if(typeof(data.datasets[i].title)=="string"){

								if(data.datasets[i].title.trim() != ""){
									nbeltLegend++;
									var textLength = ctx.measureText(data.datasets[i].title).width;
									//If the text length is longer - make that equal to longest text!
									widestLegend = (textLength > widestLegend)? textLength : widestLegend;
								}
							}
						}
					} else {
						for (var i=data.length-1;i>=0; i--){
							if(typeof(data[i].title)=="string"){
								if(data[i].title.trim() != ""){
									nbeltLegend++;
									var textLength = ctx.measureText(data[i].title).width;
									//If the text length is longer - make that equal to longest text!
									widestLegend = (textLength > widestLegend)? textLength : widestLegend;
								}
							}
						}
					}


					if(nbeltLegend>1){

						widestLegend+=config.legendBlockSize+2*(spaceLeft+spaceRight);

						availableLegendWidth=width- config.spaceLeft - config.spaceRight - 2*(borderWidth);
						if(config.legendBorders==true)availableLegendWidth -= 2*(config.legendBordersWidth)-spaceLeft-spaceRight;

						maxLegendOnLine=Math.floor(availableLegendWidth/widestLegend);
						nbLegendLines=Math.ceil(nbeltLegend/maxLegendOnLine);

						nbLegendCols=Math.ceil(nbeltLegend/nbLegendLines);

						spaceLegendHeight=nbLegendLines*(config.legendFontSize+spaceBefore+spaceAfter);

						yFirstLegendTextPos=height-borderWidth-config.spaceBottom - footNoteHeight-spaceLegendHeight+spaceBefore+config.legendFontSize;
						xFirstLegendTextPos=config.spaceLeft+(width-config.spaceLeft-config.spaceRight-nbLegendCols*widestLegend)/2+spaceLeft;

						if(config.legendBorders==true)
						{
							spaceLegendHeight+=2*config.legendBordersWidth+spaceBefore+spaceAfter;
							yFirstLegendTextPos -=(config.legendBordersWidth+spaceAfter);
							yLegendBorderPos=Math.floor(height-config.spaceBottom - borderWidth-footNoteHeight-spaceLegendHeight+(config.legendBordersWidth/2)+spaceBefore);
							xLegendBorderPos=Math.floor(xFirstLegendTextPos-spaceLeft-(config.legendBordersWidth/2));
							legendBorderHeight=Math.ceil(spaceLegendHeight-config.legendBordersWidth)-spaceBefore-spaceAfter;
							legendBorderWidth=Math.ceil(nbLegendCols*widestLegend+config.legendBordersWidth);

						}
					}

				}
			}

			// xAxisLabel

			if(drawAxis) {

				if(typeof(config.xAxisLabel)!= "undefined"){
					if(config.xAxisLabel.trim() != "")
					{
						xAxisLabelHeight= (config.xAxisFontSize+spaceBefore+spaceAfter);
						xAxisLabelPos= height - borderWidth-config.spaceBottom - footNoteHeight-spaceLegendHeight-spaceAfter;
					}
				}
			}

			xLabelWidth=0;

			if(drawAxis) {

				if(reverseAxis==false){widestLabel=widestXLabel;nblab=data.labels.length;}
				else {widestLabel=widestYLabel;nblab=ylabels.length;}


				if (availableWidth/nblab < (widestLabel+spaceBefore+spaceAfter)){
					rotateLabels = 45;
					if (availableWidth/nblab < Math.cos(rotateLabels) * widestLabel){
						 rotateLabels = 90;
						 xLabelHeight = widestLabel+spaceBefore+spaceAfter;
						 xLabelPos= height-borderWidth-config.spaceBottom-footNoteHeight-spaceLegendHeight-xAxisLabelHeight-spaceAfter-widestLabel;
						 xLabelWidth=2*config.scaleFontSize;
					}
					else{
						 xLabelHeight = Math.sin(rotateLabels) * widestLabel+spaceBefore+spaceAfter;
						 xLabelPos= height-borderWidth-config.spaceBottom-footNoteHeight-spaceLegendHeight-xAxisLabelHeight-spaceAfter-Math.sin(rotateLabels) * widestLabel;
						 xLabelWidth=Math.cos(rotateLabels)*widestLabel;
					}
				}
				else{
					rotateLabels=0;
					xLabelHeight = config.scaleFontSize+spaceBefore+spaceAfter;
					xLabelPos= height-borderWidth-config.spaceBottom-footNoteHeight-spaceLegendHeight-xAxisLabelHeight-spaceAfter;
					xLabelWidth=widestLabel+spaceBefore+spaceAfter;
				}
				leftNotUsableSize= Max ([leftNotUsableSize,borderWidth+config.spaceLeft+xLabelWidth/2] );
				rightNotUsableSize= Max ([rightNotUsableSize,borderWidth+config.spaceRight+xLabelWidth/2] );
				availableWidth=width-leftNotUsableSize-rightNotUsableSize;

			}

			bottomNotUsableHeightWithoutXLabels=borderWidth+config.spaceBottom+footNoteHeight+spaceLegendHeight+xAxisLabelHeight;
			bottomNotUsableHeightWithXLabels=bottomNotUsableHeightWithoutXLabels+xLabelHeight;
			availableHeight=height-topNotUsableSize-bottomNotUsableHeightWithXLabels;



			// ----------------------- DRAW EXTERNAL ELEMENTS -------------------------------------------------



			// Draw Borders


			if(borderWidth>0){
				ctx.save();
				ctx.beginPath();
				ctx.lineWidth=2*borderWidth;
				ctx.strokeStyle=config.canvasBordersColor;
				ctx.moveTo(0,0);
				ctx.lineTo(0,height);
				ctx.lineTo(width,height);
				ctx.lineTo(width,0);
				ctx.lineTo(0,0);
				ctx.stroke();
				ctx.restore();
			}


			// Draw Graph Title

			if(graphTitleHeight>0){
					ctx.save();
					ctx.beginPath();
					ctx.font = config.graphTitleFontStyle + " " + config.graphTitleFontSize+"px " + config.graphTitleFontFamily;
					ctx.fillStyle = config.graphTitleFontColor;
					ctx.textAlign = "center";
					ctx.translate(config.spaceLeft+(width-config.spaceLeft-config.spaceRight)/2,graphTitlePosY);
					ctx.fillText(config.graphTitle, 0,0);
					ctx.stroke();
					ctx.restore();

			}

			// Draw Graph Sub-Title

			if(graphSubTitleHeight>0){
					ctx.save();
					ctx.beginPath();
					ctx.font = config.graphSubTitleFontStyle + " " + config.graphSubTitleFontSize+"px " + config.graphSubTitleFontFamily;
					ctx.fillStyle = config.graphSubTitleFontColor;
					ctx.textAlign = "center";
					ctx.translate(config.spaceLeft+(width-config.spaceLeft-config.spaceRight)/2,graphSubTitlePosY);
					ctx.fillText(config.graphSubTitle, 0,0);
					ctx.stroke();
					ctx.restore();
			}

			// Draw Y Axis Unit


			if(yAxisUnitHeight>0){
					if(config.yAxisLeft)
					{
						ctx.save();
						ctx.beginPath();
						ctx.font = config.yAxisUnitFontStyle + " " + config.yAxisUnitFontSize+"px " + config.yAxisUnitFontFamily;
						ctx.fillStyle = config.yAxisUnitFontColor;
						ctx.textAlign = "center";
						ctx.translate(leftNotUsableSize,yAxisUnitPosY);
						ctx.fillText(config.yAxisUnit, 0,0);
						ctx.stroke();
						ctx.restore();
					}
					if(config.yAxisRight)
					{
						ctx.save();
						ctx.beginPath();
						ctx.font = config.yAxisUnitFontStyle + " " + config.yAxisUnitFontSize+"px " + config.yAxisUnitFontFamily;
						ctx.fillStyle = config.yAxisUnitFontColor;
						ctx.textAlign = "center";
						ctx.translate(width-rightNotUsableSize,yAxisUnitPosY);
						ctx.fillText(config.yAxisUnit, 0,0);
						ctx.stroke();
						ctx.restore();
					}
			}



			// Draw Y Axis Label

			if(yAxisLabelWidth>0){
					if(config.yAxisLeft) {
						ctx.save();
						ctx.beginPath();
					 ctx.font = config.yAxisFontStyle + " " + config.yAxisFontSize+"px " + config.yAxisFontFamily;
					 ctx.fillStyle = config.yAxisFontColor;
						ctx.textAlign = "center";
						ctx.translate(yAxisLabelPosLeft,topNotUsableSize+(availableHeight/2));
						ctx.rotate(-(90 * (Math.PI/180)));
						ctx.fillText(config.yAxisLabel, 0,0);
						ctx.stroke();
						ctx.restore();
					}
					if(config.yAxisRight) {
						ctx.save();
						ctx.beginPath();
						ctx.font = config.yAxisFontStyle + " " + config.yAxisFontSize+"px " + config.yAxisFontFamily;
						ctx.fillStyle = config.yAxisFontColor;
						ctx.textAlign = "center";
						ctx.translate(yAxisLabelPosRight,topNotUsableSize+(availableHeight/2));
						ctx.rotate(+(90 * (Math.PI/180)));
						ctx.fillText(config.yAxisLabel, 0,0);
						ctx.stroke();
						ctx.restore();
					}
			}



			// Draw X Axis Label

			if(xAxisLabelHeight>0){
					ctx.save();
					ctx.beginPath();
					ctx.font = config.yAxisFontStyle + " " + config.yAxisFontSize+"px " + config.yAxisFontFamily;
					ctx.fillStyle = config.yAxisFontColor;
					ctx.textAlign = "center";
					ctx.translate(leftNotUsableSize+(availableWidth/2),xAxisLabelPos);
					ctx.fillText(config.xAxisLabel, 0,0);
					ctx.stroke();
					ctx.restore();
			}

			// Draw Legend



			if(nbeltLegend>1)
			{
				if(config.legendBorders==true)
				{
					ctx.save();
					ctx.beginPath();

					ctx.lineWidth=config.legendBordersWidth;
					ctx.strokeStyle=config.legendBordersColors;

					ctx.moveTo(xLegendBorderPos,yLegendBorderPos);
					ctx.lineTo(xLegendBorderPos,yLegendBorderPos+legendBorderHeight);
					ctx.lineTo(xLegendBorderPos+legendBorderWidth,yLegendBorderPos+legendBorderHeight);
					ctx.lineTo(xLegendBorderPos+legendBorderWidth,yLegendBorderPos);
					ctx.lineTo(xLegendBorderPos,yLegendBorderPos);
					ctx.lineTo(xLegendBorderPos+legendBorderWidth,yLegendBorderPos);
					ctx.lineTo(xLegendBorderPos,yLegendBorderPos);
					ctx.lineTo(xLegendBorderPos,yLegendBorderPos+legendBorderHeight);

					ctx.stroke();
					ctx.restore();



				}

				nbcols=nbLegendCols-1;
				ypos=yFirstLegendTextPos-(config.legendFontSize+spaceBefore+spaceAfter);
				xpos=0;



				if(drawLegendOnData)fromi=data.datasets.length;
				else fromi=data.length;


				for (var i=fromi-1;i>=0; i--){

					orderi=i;
					if(reverseLegend)
					{
						if(drawLegendOnData)orderi=data.datasets.length-i-1;
						else orderi=data.length-i-1;
					}

					if(drawLegendOnData)tpof=typeof(data.datasets[orderi].title);
					else tpof=typeof(data[orderi].title)

					if(tpof=="string"){
						if(drawLegendOnData)lgtxt=data.datasets[orderi].title.trim();
						else lgtxt=data[orderi].title.trim();
						if(lgtxt != ""){

							nbcols++;
							if(nbcols==nbLegendCols)
							{
								nbcols=0;
								xpos=xFirstLegendTextPos;
								ypos+=config.legendFontSize+spaceBefore+spaceAfter;

							}
							else
							{
								xpos+=widestLegend;
							}

							ctx.save();
							ctx.beginPath();


							if(drawLegendOnData) ctx.strokeStyle = data.datasets[orderi].strokeColor;
							else ctx.strokeStyle = data[orderi].color;

							if (config.datasetFill){
									ctx.lineWidth = 1;
									ctx.moveTo(xpos+2,ypos);
									ctx.lineTo(xpos+2+config.legendBlockSize,ypos);
									ctx.lineTo(xpos+2+config.legendBlockSize,ypos-config.legendFontSize+2);
									ctx.lineTo(xpos+2,ypos-config.legendFontSize+2);
									ctx.lineTo(xpos+2,ypos);
									ctx.closePath();
									if(drawLegendOnData) ctx.fillStyle = data.datasets[orderi].fillColor;
									else ctx.fillStyle = data[orderi].color;
									ctx.fill();
							}
							else
							{
								ctx.lineWidth = config.datasetStrokeWidth;
								ctx.moveTo(xpos+2,ypos-(config.legendFontSize/2));
								ctx.lineTo(xpos+2+config.legendBlockSize,ypos-(config.legendFontSize/2));
							}
							ctx.stroke();
							ctx.restore();



							ctx.save();
							ctx.beginPath();
							ctx.font = config.legendFontStyle + " " + config.legendFontSize+"px " + config.legendFontFamily;


							ctx.fillStyle = config.legendFontColor;
							ctx.textAlign = "left";

							ctx.translate(xpos+config.legendBlockSize+spaceBefore+spaceAfter,ypos);
							ctx.fillText(lgtxt, 0,0);
							ctx.stroke();
							ctx.restore();
						}
					}
				}

			}

			// Draw FootNote
			if(config.footNote.trim() != "")  {
					ctx.save();
					ctx.font = config.footNoteFontStyle + " " + config.footNoteFontSize+"px " + config.footNoteFontFamily;
					ctx.fillStyle = config.footNoteFontColor;
					ctx.textAlign = "center";
					ctx.translate(leftNotUsableSize+(availableWidth/2),footNotePosY);
					ctx.fillText(config.footNote, 0,0);
					ctx.stroke();
					ctx.restore();
			}

			clrx=leftNotUsableSize;
			clrwidth=availableWidth;

			if(config.yAxisLeft)
			{
				clrx-=yLabelsWidth;
				clrwidth+=yLabelsWidth;
			}
			if(config.yAxisRight)
			{
				clrwidth+=yLabelsWidth;
			}



			clry=topNotUsableSize;

			clrheight=availableHeight+xLabelHeight;


			return {

				leftNotUsableSize : leftNotUsableSize,
				rightNotUsableSize : rightNotUsableSize,
				availableWidth : availableWidth,
				topNotUsableSize : topNotUsableSize,
				bottomNotUsableHeightWithoutXLabels : bottomNotUsableHeightWithoutXLabels,
				bottomNotUsableHeightWithXLabels : bottomNotUsableHeightWithXLabels,
				availableHeight : availableHeight,
				widestXLabel : widestXLabel,
				rotateLabels : rotateLabels,
				xLabelPos : xLabelPos,
				clrx : clrx,
				clry : clry,
				clrwidth : clrwidth,
				clrheight : clrheight

			};
	 }
};



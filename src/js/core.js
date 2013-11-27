var chart = this;

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


var clear = function(c) {
	c.clearRect(0, 0, width, height);
};



function calculateOffset(val, calculatedScale, scaleHop) {
	var outerValue = calculatedScale.steps * calculatedScale.stepValue;
	var adjustedValue = val - calculatedScale.graphMin;
	var scalingFactor = CapValue(adjustedValue / outerValue, 1, 0);
	return (scaleHop * calculatedScale.steps) * scalingFactor;
}

function animationLoop(config, drawScale, drawData, ctx) {
	var animFrameAmount = (config.animation) ? 1 / CapValue(config.animationSteps, Number.MAX_VALUE, 1) : 1,
		easingFunction = animationOptions[config.animationEasing],
		percentAnimComplete = (config.animation) ? 0 : 1;



	if (typeof drawScale !== "function") drawScale = function() {};

	requestAnimFrame(animLoop);

	function animateFrame() {
		var easeAdjustedAnimationPercent = (config.animation) ? CapValue(easingFunction(percentAnimComplete), null, 0) : 1;
		clear(ctx);
		if (config.scaleOverlay) {
			drawData(easeAdjustedAnimationPercent);
			drawScale();
		} else {
			drawScale();
			drawData(easeAdjustedAnimationPercent);
		}
	}

	function animLoop() {
		//We need to check if the animation is incomplete (less than 1), or complete (1).
		percentAnimComplete += animFrameAmount;
		animateFrame();
		//Stop the loop continuing forever
		if (percentAnimComplete <= 1) {
			requestAnimFrame(animLoop);
		} else {
			if (typeof config.onAnimationComplete == "function") config.onAnimationComplete();
		}

	}

}

//Declare global functions to be called within this namespace here.


// shim layer with setTimeout fallback
var requestAnimFrame = (function() {
	return window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function(callback) {
			window.setTimeout(callback, 1000 / 60);
	};
})();

function calculateScale(drawingHeight, maxSteps, minSteps, maxValue, minValue, labelTemplateString) {
	var graphMin, graphMax, graphRange, stepValue, numberOfSteps, valueRange, rangeOrderOfMagnitude, decimalNum;

	valueRange = maxValue - minValue;

	rangeOrderOfMagnitude = calculateOrderOfMagnitude(valueRange);

	graphMin = Math.floor(minValue / (1 * Math.pow(10, rangeOrderOfMagnitude))) * Math.pow(10, rangeOrderOfMagnitude);

	graphMax = Math.ceil(maxValue / (1 * Math.pow(10, rangeOrderOfMagnitude))) * Math.pow(10, rangeOrderOfMagnitude);

	graphRange = graphMax - graphMin;

	stepValue = Math.pow(10, rangeOrderOfMagnitude);

	numberOfSteps = Math.round(graphRange / stepValue);

	//Compare number of steps to the max and min for that size graph, and add in half steps if need be.	        
	while (numberOfSteps < minSteps || numberOfSteps > maxSteps) {
		if (numberOfSteps < minSteps) {
			stepValue /= 2;
			numberOfSteps = Math.round(graphRange / stepValue);
		} else {
			stepValue *= 2;
			numberOfSteps = Math.round(graphRange / stepValue);
		}
	};

	var labels = [];
	populateLabels(labelTemplateString, labels, numberOfSteps, graphMin, stepValue);

	return {
		steps: numberOfSteps,
		stepValue: stepValue,
		graphMin: graphMin,
		labels: labels

	}

	function calculateOrderOfMagnitude(val) {
		return Math.floor(Math.log(val) / Math.LN10);
	}


}

//Populate an array of all the labels by interpolating the string.
function populateLabels(labelTemplateString, labels, numberOfSteps, graphMin, stepValue) {
	if (labelTemplateString) {
		//Fix floating point errors by setting to fixed the on the same decimal as the stepValue.
		for (var i = 1; i < numberOfSteps + 1; i++) {
			labels.push(tmpl(labelTemplateString, {
				value: (graphMin + (stepValue * i)).toFixed(getDecimalPlaces(stepValue))
			}));
		}
	}
}

//Max value from array
function Max(array) {
	return Math.max.apply(Math, array);
};
//Min value from array
function Min(array) {
	return Math.min.apply(Math, array);
};
//Default if undefined
function Default(userDeclared, valueIfFalse) {
	if (!userDeclared) {
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
function CapValue(valueToCap, maxValue, minValue) {
	if (isNumber(maxValue)) {
		if (valueToCap > maxValue) {
			return maxValue;
		}
	}
	if (isNumber(minValue)) {
		if (valueToCap < minValue) {
			return minValue;
		}
	}
	return valueToCap;
}

function getDecimalPlaces(num) {
	var numberOfDecimalPlaces;
	if (num % 1 != 0) {
		return num.toString().split(".")[1].length
	} else {
		return 0;
	}

}

function mergeChartConfig(defaults, userDefined) {
	var returnObj = {};
	for (var attrname in defaults) {
		returnObj[attrname] = defaults[attrname];
	}
	for (var attrname in userDefined) {
		returnObj[attrname] = userDefined[attrname];
	}
	return returnObj;
}

//Javascript micro templating by John Resig - source at http://ejohn.org/blog/javascript-micro-templating/
var cache = {};

function tmpl(str, data) {
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
		.split("\r").join("\\'") + "');}return p.join('');");

	// Provide some basic currying to the user
	return data ? fn(data) : fn;
};
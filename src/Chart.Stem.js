(function() {
	//add an error bar class to the basic chart elements
	Chart.ErrorBar = Chart.Rectangle.extend({
		draw : function() {
			var ctx = this.ctx,
				halfWidth = this.width/2,
				leftX = this.x - halfWidth,
				rightX = this.x + halfWidth,
				top = this.base - (this.base - this.yUp),
				bottom = this.base - (this.base - this.yDown),
				middle = this.base - (this.base - this.y)
			ctx.strokeStyle = this.errorStrokeColor;
			ctx.lineWidth = this.errorStrokeWidth;
			//draw upper error bar
			if (this.errorDir != "down") {		
				ctx.beginPath();
				ctx.moveTo(this.x, middle);
				ctx.lineTo(this.x, top);
				ctx.stroke();
				ctx.beginPath();
				ctx.moveTo(leftX, top);
				ctx.lineTo(rightX, top);
				ctx.stroke();
			}			
			//draw lower error bar
			if (this.errorDir != "up") {						
				ctx.beginPath();
				ctx.moveTo(this.x, middle);
				ctx.lineTo(this.x, bottom);
				ctx.stroke();
				ctx.beginPath();
				ctx.moveTo(leftX, bottom);
				ctx.lineTo(rightX, bottom);
				ctx.stroke();					
			}
		}
	})
}).call(this);	

/*
//mathematical funcitons for handling error bars
average = helpers.average = function( data ) {
	//calculate the average value 
	var sum = 0;
	for (var x = 0; x < data.length; x++) {
		sum = sum + data[x];
	}
	return sum / data.length;
},
range = helpers.range = function(data) {
	//calculate the range of the data 
	//(the difference between the maximum and average value) 
	data.sort(function(a, b){return a - b}); //sorts highest to lowest
	var maximum = data[data.length - 1];
	return maximum - helpers.average(data);
},
stdev = helpers.stdev = function(data) {
	//return the standard deviation of an array of numbers
	var sum = 0;
	for (var x = 0; x < data.length; x++) {
		sum = sum + Math.pow(data[x] - helpers.average(data), 2);
	}
	return Math.sqrt(sum / (data.length - 1));
},
stderr = helpers.stderr = function(data) {
	return helpers.stdev(data) / Math.sqrt(data.length);
};
*/
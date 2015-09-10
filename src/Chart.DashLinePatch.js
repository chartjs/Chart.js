(function() {
    "use strict";
    
    var root = this;
    var CanvasPrototype = this.CanvasRenderingContext2D && CanvasRenderingContext2D.prototype;
    if(!CanvasPrototype || typeof CanvasPrototype.setLineDash === 'function') {
        return;
    }else if(typeof CanvasPrototype.setLineDash === 'undefined' && CanvasPrototype.lineTo) {
        /**
         * reference
         * URL: http://stackoverflow.com/questions/4576724/dotted-stroke-in-canvas
         * @param  {[Integer]}  x           line start position x
         * @param  {[Integer]}  y           line start position y
         * @param  {[Integer]}  x2          line end position x
         * @param  {[Integer]}  y2          line end position y
         * @param  {[Array]}    dashArray   dash line setting    
         * @return {[Null]}     void
         */
        CanvasPrototype.dashedLine = function(x, y, x2, y2, dashArray) {
            if (!dashArray) {
                dashArray = [10, 5];
            }
            if (dashLength == 0) {
                dashLength = 0.001; // Hack for Safari
            }

            var dashCount = dashArray.length;
            var dx = (x2 - x),
                dy = (y2 - y);
            var slope = dx ? dy / dx : 1e15;
            var distRemaining = Math.sqrt(dx * dx + dy * dy);
            var dashIndex = 0,
                draw = true;

            this.moveTo(x, y);
            while (distRemaining >= 0.1) {
                var dashLength = dashArray[dashIndex++ % dashCount];
                if (dashLength > distRemaining) {
                    dashLength = distRemaining;
                }
                var xStep = Math.sqrt(dashLength * dashLength / (1 + slope * slope));

                if (dx < 0) {
                    xStep = -xStep;
                }

                x += xStep
                y += slope * xStep;
                this[draw ? 'lineTo' : 'moveTo'](x, y);
                distRemaining -= dashLength;
                draw = !draw;
            }
        }
    }
}).call(this);
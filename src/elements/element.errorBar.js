(function() {

	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;

    Chart.elements.ErrorBar = Chart.Element.extend({
      draw: function() {

				var ctx = this._chart.ctx;
				var vm = this._view;

				console.log(this);

      }
    })


}).call(this);

'use strict';

module.exports = function(Chart) {
	var helpers = Chart.helpers;
	/*
	 * @namespace Chart.Interaction
	 * Contains interaction related functions
	 */
	Chart.Interaction = {
		// Helper function for different modes
		modes: {
			single: function(chartInstance, e) {
				var eventPosition = helpers.getRelativePosition(e, chartInstance.chart);
				var elementsArray = [];

				helpers.each(chartInstance.data.datasets, function(dataset, datasetIndex) {
					if (chartInstance.isDatasetVisible(datasetIndex)) {
						var meta = chartInstance.getDatasetMeta(datasetIndex);
						helpers.each(meta.data, function(element) {
							if (element.inRange(eventPosition.x, eventPosition.y)) {
								elementsArray.push(element);
								return elementsArray;
							}
						});
					}
				});

				return elementsArray.slice(0, 1);
			},
			label: function(chartInstance, e) {
				var eventPosition = helpers.getRelativePosition(e, chartInstance.chart);
				var elementsArray = [];

				var found = function() {
					if (chartInstance.data.datasets) {
						for (var i = 0; i < chartInstance.data.datasets.length; i++) {
							var meta = chartInstance.getDatasetMeta(i);
							if (chartInstance.isDatasetVisible(i)) {
								for (var j = 0; j < meta.data.length; j++) {
									if (meta.data[j].inRange(eventPosition.x, eventPosition.y)) {
										return meta.data[j];
									}
								}
							}
						}
					}
				}.call(chartInstance);

				if (!found) {
					return elementsArray;
				}

				helpers.each(chartInstance.data.datasets, function(dataset, datasetIndex) {
					if (chartInstance.isDatasetVisible(datasetIndex)) {
						var meta = chartInstance.getDatasetMeta(datasetIndex),
							element = meta.data[found._index];
						if (element && !element._view.skip) {
							elementsArray.push(element);
						}
					}
				}, chartInstance);

				return elementsArray;
			},
			dataset: function(chartInstance, e) {
				var elementsArray = chartInstance.getElementAtEvent(e);

				if (elementsArray.length > 0) {
					elementsArray = chartInstance.getDatasetMeta(elementsArray[0]._datasetIndex).data;
				}

				return elementsArray;
			},
			'x-axis': function(chartInstance, e) {
				var eventPosition = helpers.getRelativePosition(e, chartInstance.chart);
				var elementsArray = [];

				var found = function() {
					if (chartInstance.data.datasets) {
						for (var i = 0; i < chartInstance.data.datasets.length; i++) {
							var meta = chartInstance.getDatasetMeta(i);
							if (chartInstance.isDatasetVisible(i)) {
								for (var j = 0; j < meta.data.length; j++) {
									if (meta.data[j].inLabelRange(eventPosition.x, eventPosition.y)) {
										return meta.data[j];
									}
								}
							}
						}
					}
				}.call(chartInstance);

				if (!found) {
					return elementsArray;
				}

				helpers.each(chartInstance.data.datasets, function(dataset, datasetIndex) {
					if (chartInstance.isDatasetVisible(datasetIndex)) {
						var meta = chartInstance.getDatasetMeta(datasetIndex);
						var index = helpers.findIndex(meta.data, function(it) {
							return found._model.x === it._model.x;
						});
						if (index !== -1 && !meta.data[index]._view.skip) {
							elementsArray.push(meta.data[index]);
						}
					}
				}, chartInstance);

				return elementsArray;
			},

			// Modes introduced in v2.4
		}
	};
};

'use strict';

module.exports = function(Chart) {
	var helpers = Chart.helpers;

	/**
	 * Helper function to get all elements in the chart
	 * @private
	 * @param chartInstance {ChartInstance} the chart
	 * @return {ChartElement[]} all elements in the chart
	 */
	function getAllItems(chartInstance) {
		var items = [].concat.apply([], chartInstance.data.datasets.map(function(dataset, i) {
			var meta = chartInstance.getDatasetMeta(i);
			return chartInstance.isDatasetVisible(i) ? meta.data : [];
		}));

		// filter out any items that are skipped
		items.filter(function(element) {
			return !element._view.skip;
		});

		return items;
	}

	/**
	 * Helper function to get the items that intersect the event position
	 * @param items {ChartElement[]} elements to filter
	 * @param eventPosition {Point} the point to be nearest to
	 * @return {ChartElement[]} the nearest items
	 */
	function getIntersectItems(chartInstance, eventPosition) {
		var intersectItems = [];

		helpers.each(chartInstance.data.datasets, function(dataset, datasetIndex) {
			if (chartInstance.isDatasetVisible(datasetIndex)) {
				var meta = chartInstance.getDatasetMeta(datasetIndex);
				helpers.each(meta.data, function(element) {
					if (element.inRange(eventPosition.x, eventPosition.y)) {
						intersectItems.push(element);
					}
				});
			}
		});

		return intersectItems;
	}

	/**
	 * Helper function to get the items nearest to the event position
	 * @param items {ChartElement[]} elements to filter
	 * @param eventPosition {Point} the point to be nearest to
	 * @return {ChartElement[]} the nearest items
	 */
	function getNearestItems(items, eventPosition) {
		var minDistance = Number.POSITIVE_INFINITY;
		var nearestItems = [];
		helpers.each(items, function(element) {
			var distance = Math.round(element.distanceToCenter(eventPosition));

			if (distance < minDistance) {
				nearestItems = [element];
				minDistance = distance;
			} else if (distance === minDistance) {
				// Can have multiple items at the same distance in which case we sort by size
				nearestItems.push(element);
			}
		});

		return nearestItems;
	}

	function indexMode(chartInstance, e, options) {
		var eventPosition = helpers.getRelativePosition(e, chartInstance.chart);
		var items = options.intersect ? getIntersectItems(chartInstance, eventPosition) : getNearestItems(getAllItems(chartInstance), eventPosition);

		var elementsArray = [];

		if (items.length) {
			helpers.each(chartInstance.data.datasets, function(dataset, datasetIndex) {
				if (chartInstance.isDatasetVisible(datasetIndex)) {
					var meta = chartInstance.getDatasetMeta(datasetIndex),
						element = meta.data[items[0]._index];

					// don't count items that are skipped (null data)
					if (element && !element._view.skip) {
						elementsArray.push(element);
					}
				}
			});
		}

		return elementsArray;
	}

	/**
	 * @interface IInteractionOptions
	 */
	/**
	 * If true, only consider items that intersect the point
	 * @name IInterfaceOptions#boolean
	 * @type Boolean
	 */

	/**
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

			// Old label mode is the new (v2.4) index mode
			/**
			 * @function Chart.Interaction.modes.label
			 * @deprecated since version 2.4.0
			 */
			label: indexMode,

			/**
			 * Returns items at the same index. If the options.intersect parameter is true, we only return items if we intersect something
			 * If the options.intersect mode is false, we find the nearest item and return the items at the same index as that item
			 * @function Chart.Interaction.modes.index
			 * @since v2.4.0
			 * @param chartInstance {ChartInstance} the chart we are returning items from
			 * @param e {Event} the event we are find things at
			 * @param options {IInteractionOptions} options to use during interaction
			 * @return {Chart.Element[]} Array of elements that are under the point. If none are found, an empty array is returned
			 */
			index: indexMode,

			/**
			 * Returns items in the same dataset. If the options.intersect parameter is true, we only return items if we intersect something
			 * If the options.intersect is false, we find the nearest item and return the items in that dataset
			 * @function Chart.Interaction.modes.dataset
			 * @param chartInstance {ChartInstance} the chart we are returning items from
			 * @param e {Event} the event we are find things at
			 * @param options {IInteractionOptions} options to use during interaction
			 * @return {Chart.Element[]} Array of elements that are under the point. If none are found, an empty array is returned
			 */
			dataset: function(chartInstance, e, options) {
				var eventPosition = helpers.getRelativePosition(e, chartInstance.chart);
				var items = options.intersect ? getIntersectItems(chartInstance, eventPosition) : getNearestItems(getAllItems(chartInstance), eventPosition);

				if (items.length > 0) {
					items = chartInstance.getDatasetMeta(items[0]._datasetIndex).data;
				}

				return items;
			},

			/**
			 * @function Chart.Interaction.modes.x-axis
			 * @deprecated since version 2.4.0. Use index mode and intersect == true
			 */
			'x-axis': function(chartInstance, e) {
				return indexMode(chartInstance, e, true);
			},

			/**
			 * Point mode returns all elements that hit test based on the event position
			 * of the event
			 * @function Chart.Interaction.modes.intersect
			 * @param chartInstance {ChartInstance} the chart we are returning items from
			 * @param e {Event} the event we are find things at
			 * @return {Chart.Element[]} Array of elements that are under the point. If none are found, an empty array is returned
			 */
			point: function(chartInstance, e) {
				var eventPosition = helpers.getRelativePosition(e, chartInstance.chart);
				var elementsArray = getIntersectItems(chartInstance, eventPosition);
				return elementsArray;
			},

			/**
			 * nearest mode returns the element closest to the point
			 * @function Chart.Interaction.modes.intersect
			 * @param chartInstance {ChartInstance} the chart we are returning items from
			 * @param e {Event} the event we are find things at
			 * @param options {IInteractionOptions} options to use
			 * @return {Chart.Element[]} Array of elements that are under the point. If none are found, an empty array is returned
			 */
			nearest: function(chartInstance, e, options) {
				var eventPosition = helpers.getRelativePosition(e, chartInstance.chart);
				var items = options.intersect ? getIntersectItems(chartInstance, eventPosition) : getAllItems(chartInstance);

				// Filter to nearest items
				var nearestItems = getNearestItems(items, eventPosition);

				// We have multiple items at the same distance from the event. Now sort by smallest
				if (nearestItems.length > 1) {
					nearestItems.sort(function(a, b) {
						var sizeA = a.getArea();
						var sizeB = b.getArea();
						var ret = sizeA - sizeB;

						if (ret === 0) {
							// if equal sort by dataset index
							ret = a._datasetIndex - b._datasetIndex;
						}

						return ret;
					});
				}

				// Return only 1 item
				return nearestItems.slice(0, 1);
			}
		}
	};
};

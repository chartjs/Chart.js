'use strict';

module.exports = function(Chart) {

	/*
	 * @namespace Chart.Interaction
	 * Contains interaction related functions
	 */
	Chart.Interaction = {
		// Helper function for different modes
		modes: {
			single: function(chartInstance, e) {
				return chartInstance.getElementAtEvent(e);
			},
			label: function(chartInstance, e) {
				return chartInstance.getElementsAtEvent(e);
			},
			dataset: function(chartInstance, e) {
				return chartInstance.getDatasetAtEvent(e);
			},
			'x-axis': function(chartInstance, e) {
				return chartInstance.getElementsAtXAxis(e);
			}
		}
	};
};

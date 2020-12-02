const pkg = require('../package.json');
const docsVersion = pkg.version.indexOf('-') > -1 ? 'next' : 'latest';

module.exports = {
	someSidebar: {
		Introduction: ['index'],
		'Getting Started': [
			'getting-started/index',
			'getting-started/installation',
			'getting-started/integration',
			'getting-started/usage',
			'getting-started/v3-migration'
		],
		General: [
			'general/data-structures',
			'general/accessibility',
			'general/responsive',
			'general/device-pixel-ratio',
			'general/locale',
			{Interactions: ['general/interactions/index', 'general/interactions/events', 'general/interactions/modes']},
			'general/options',
			'general/colors',
			'general/fonts',
			'general/performance'
		],
		Configuration: [
			'configuration/index',
			'configuration/animations',
			'configuration/layout',
			'configuration/legend',
			'configuration/title',
			'configuration/tooltip',
			'configuration/elements'
		],
		'Chart Types': [
			'charts/line',
			'charts/bar',
			'charts/radar',
			'charts/doughnut',
			'charts/polar',
			'charts/bubble',
			'charts/scatter',
			'charts/area',
			'charts/mixed'
		],
		Axes: [
			'axes/index',
			{Cartesian: [
				'axes/cartesian/index',
				'axes/cartesian/category',
				'axes/cartesian/linear',
				'axes/cartesian/logarithmic',
				'axes/cartesian/time',
				'axes/cartesian/timeseries'
			]},
			{Radial: [
				'axes/radial/index',
				'axes/radial/linear'
			]},
			'axes/labelling',
			'axes/styling'
		],
		Developers: [
			'developers/index',
			'developers/api',
			{
				type: 'link',
				label: 'TypeDoc',
				href: 'https://chartjs.org/docs/' + docsVersion + '/typedoc/'
			},
			'developers/updates',
			'developers/plugins',
			'developers/charts',
			'developers/axes',
			'developers/contributing',
			'developers/publishing'
		],
		'Additional Notes': [
			'notes/comparison',
			{
				type: 'link',
				label: 'Extensions',
				href: 'https://github.com/chartjs/awesome'
			},
			'notes/license'
		]
	},
};

/* eslint-env es6 */
const cleancss = require('clean-css');
const path = require('path');

const UMD_WRAPPER_RE = /(\(function \(global, factory\) \{)((?:\s.*?)*)(\}\(this,)/;
const CJS_FACTORY_RE = /(module.exports = )(factory\(.*?\))( :)/;
const AMD_FACTORY_RE = /(define\()(.*?, factory)(\) :)/;

function optional(config = {}) {
	return {
		name: 'optional',
		renderChunk(code, chunk, options) {
			if (options.format !== 'umd') {
				this.error('only UMD format is currently supported');
			}

			const wrapper = UMD_WRAPPER_RE.exec(code);
			const include = config.include;
			if (!wrapper) {
				this.error('failed to parse the UMD wrapper');
			}

			let content = wrapper[2];
			let factory = (CJS_FACTORY_RE.exec(content) || [])[2];
			let updated = false;

			for (let lib of chunk.imports) {
				if (!include || include.indexOf(lib) !== -1) {
					const regex = new RegExp(`require\\('${lib}'\\)`);
					if (!regex.test(factory)) {
						this.error(`failed to parse the CJS require for ${lib}`);
					}

					// We need to write inline try / catch with explicit require
					// in order to enable statical extraction of dependencies:
					// try { return require('moment'); } catch(e) {}
					const loader = `function() { try { return require('${lib}'); } catch(e) { } }()`;
					factory = factory.replace(regex, loader);
					updated = true;
				}
			}

			if (!updated) {
				return;
			}

			// Replace the CJS factory by our updated one.
			content = content.replace(CJS_FACTORY_RE, `$1${factory}$3`);

			// Replace the AMD factory by our updated one: we need to use the
			// following AMD form in order to be able to try/catch require:
			// define(['require'], function(require) { ... require(...); ... })
			// https://github.com/amdjs/amdjs-api/wiki/AMD#using-require-and-exports
			content = content.replace(AMD_FACTORY_RE, `$1['require'], function(require) { return ${factory}; }$3`);

			return code.replace(UMD_WRAPPER_RE, `$1${content}$3`);
		}
	};
}

// https://github.com/chartjs/Chart.js/issues/5208
function stylesheet(config = {}) {
	const minifier = new cleancss();
	const styles = [];

	return {
		name: 'stylesheet',
		transform(code, id) {
			// Note that 'id' can be mapped to a CJS proxy import, in which case
			// 'id' will start with 'commonjs-proxy', so let's first check if we
			// are importing an existing css file (i.e. startsWith()).
			if (!id.startsWith(path.resolve('.')) || !id.endsWith('.css')) {
				return;
			}

			if (config.minify) {
				code = minifier.minify(code).styles;
			}

			// keep track of all imported stylesheets (already minified)
			styles.push(code);

			return {
				code: 'export default ' + JSON.stringify(code)
			};
		},
		generateBundle(opts, bundle) {
			if (!config.extract) {
				return;
			}

			const entry = Object.keys(bundle).find(v => bundle[v].isEntry);
			const name = (entry || '').replace(/\.js$/i, '.css');
			if (!name) {
				this.error('failed to guess the output file name');
			}

			bundle[name] = {
				code: styles.filter(v => !!v).join('')
			};
		}
	};
}

module.exports = {
	optional,
	stylesheet
};

/* eslint-env es6 */

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

module.exports = {
	optional
};

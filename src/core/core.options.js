import {isArray, _capitalize} from '../helpers/helpers.core';

const notIndexable = ['borderDash', 'fill'];
export const privatePrefixChars = ['_', '$'];
const isScriptable = (value) => typeof value === 'function';
const isIndexable = (key, value) => isArray(value) && notIndexable.indexOf(key) === -1;
const isPrivate = (key) => privatePrefixChars.indexOf(key.charAt(0)) !== -1;

export const prefixFromMode = (mode) => mode === 'active' ? 'hover' : '';

export default class Options {
	constructor(scopes, keys, prefixes) {
		const options = this._options = Object.create(null);
		this._contextSensitive = false;

		for (let i = 0; i < keys.length; i++) {
			const key = keys[i];
			const value = options[key] = firstDefinedValue(scopes, key, prefixes);
			if (isScriptable(value) || isIndexable(key, value)) {
				this._contextSensitive = true;
			}
		}
		options.$shared = !this._contextSensitive;
	}

	disableSharing() {
		this._contextSensitive = true;
	}

	isContextSensitive() {
		return this._contextSensitive;
	}

	resolve(context, active) {
		const options = this._options;
		if (!this._contextSensitive && !active) {
			// No scriptable options used, values are already final
			return options;
		}
		const result = Object.create(null);
		const keys = Object.keys(options);
		for (let i = 0; i < keys.length; i++) {
			const key = keys[i];
			if (isPrivate(key)) {
				continue;
			}
			const value = options[key];
			result[key] = isScriptable(value) ? value(context) :
				isIndexable(key, value) ? value[context.index % value.length] : value;
		}
		result.$shared = false;
		return result;
	}
}

function firstDefinedValue(scopes, name, prefixes) {
	const hover = prefixes.indexOf('hover') !== -1;
	for (let prefixIndex = 0; prefixIndex < prefixes.length; prefixIndex++) {
		const prefix = prefixes[prefixIndex];
		if (hover && prefix === '' && name.indexOf('Color') !== -1) {
			// prevent defaulting hovedBackgroundColor to backgroundColor,
			// to allow adding automatic hover colors
			continue;
		}
		const readKey = prefix ? prefix + _capitalize(name) : name;
		for (let scopeIndex = 0; scopeIndex < scopes.length; scopeIndex++) {
			const scope = scopes[scopeIndex];
			if (!scope) {
				continue;
			}

			const value = scope[readKey];
			if (typeof value === 'undefined') {
				continue;
			}
			return value;
		}
	}
}

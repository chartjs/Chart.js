import {_isDomSupported} from '../helpers';
import BasePlatform from './platform.base';
import BasicPlatform from './platform.basic';
import DomPlatform from './platform.dom';

export function _detectPlatform(canvas) {
  if (!_isDomSupported() || (typeof OffscreenCanvas !== 'undefined' && canvas instanceof OffscreenCanvas)) {
    return BasicPlatform;
  }
  return DomPlatform;
}

export {BasePlatform, BasicPlatform, DomPlatform};

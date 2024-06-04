import { _adapters } from '../../src/types.js';

_adapters._date.override<{myOption: boolean}>({
  init() {
    const booleanOption: boolean = this.options.myOption;

    // @ts-expect-error Options is readonly.
    this.options = {};
  },
  // @ts-expect-error Should return string.
  format(timestamp) {
    const numberArg: number = timestamp;
  }
});

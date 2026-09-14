import { TimeScaleTimeOptions } from '../../../src/types.js';

// `time.parser` and `time.tooltipFormat` have no default value, so they must stay
// optional when the resolved time scale options are referenced directly.
const minimal: TimeScaleTimeOptions = {
  unit: 'year',
  round: false,
  isoWeekday: false,
  minUnit: 'millisecond',
  displayFormats: {
    month: 'yy'
  }
};

const withParser: TimeScaleTimeOptions = {
  ...minimal,
  parser: 'yyyy-MM-dd',
  tooltipFormat: 'eeee, MMM dd, yyyy'
};

const withParserFunction: TimeScaleTimeOptions = {
  ...minimal,
  parser: (value: unknown) => Number(value)
};

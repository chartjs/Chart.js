import type { ParsedDataType } from '../../src/types.js';

interface test {
  pie: ParsedDataType<'pie'>,
  line: ParsedDataType<'line'>,
  testA: ParsedDataType<'pie' | 'line' | 'bar'>
  testB: ParsedDataType<'pie' | 'line' | 'bar'>
  testC: ParsedDataType<'pie' | 'line' | 'bar'>
}

const testImpl: test = {
  pie: 1,
  line: { x: 1, y: 2 },
  testA: 1,
  testB: { x: 1, y: 2 },
  // @ts-expect-error testC should be limited to pie/line datatypes
  testC: 'test'
};

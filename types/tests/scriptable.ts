import { Scriptable } from '../index.esm';

interface test {
  pie?: Scriptable<number, 'pie'>,
  line?: Scriptable<number, 'line'>,
  testA?: Scriptable<number, 'pie' | 'line' | 'bar'>
  testB?: Scriptable<number, 'pie' | 'line' | 'bar'>
  testC?: Scriptable<number, 'pie' | 'line' | 'bar'>
}

const pieScriptable: Scriptable<number, 'pie'> = (ctx) => ctx.parsed;
const lineScriptable: Scriptable<number, 'line'> = (ctx) => ctx.parsed.x + ctx.parsed.y;

export const testImpl: test = {
  pie: (ctx) => ctx.parsed,
  line: (ctx) => ctx.parsed.x + ctx.parsed.y,
  testA: pieScriptable,
  testB: lineScriptable,
  // @FIXME ts-expect-error combined type should not be any
  testC: (ctx) => ctx.fail
};

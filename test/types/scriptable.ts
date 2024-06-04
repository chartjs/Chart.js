import type { ChartType, Scriptable, ScriptableContext } from '../../src/types.js';

interface test {
  pie?: Scriptable<number, ScriptableContext<'pie'>>,
  line?: Scriptable<number, ScriptableContext<'line'>>,
  testA?: Scriptable<number, ScriptableContext<'pie'>>
  testB?: Scriptable<number, ScriptableContext<'line' | 'bar'>>
  testC?: Scriptable<number, ScriptableContext<'pie' | 'line' | 'bar'>>
  testD?: Scriptable<number, ScriptableContext<ChartType>>
}

const testImpl: test = {
  pie: (ctx) => ctx.parsed + ctx.chart.width,
  line: (ctx) => ctx.parsed.x + ctx.parsed.y,
  testA: (ctx) => ctx.parsed + ctx.dataset.data[0],
  testB: (ctx) => ctx.parsed.x + ctx.parsed.y,
  // @ts-expect-error combined type should not be any
  testC: (ctx) => ctx.fail,
  // combined types are intersections and permit invalid usage
  testD: (ctx) => ctx.parsed + ctx.parsed.x + ctx.parsed.r + ctx.parsed._custom.barEnd
};


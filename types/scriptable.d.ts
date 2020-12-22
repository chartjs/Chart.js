export type Scriptable<T, TContext> = T | ((ctx: TContext) => T);
export type ScriptableOptions<T, TContext> = { [P in keyof T]: Scriptable<T[P], TContext> };
export type ScriptableAndArray<T, TContext> = readonly T[] | Scriptable<T, TContext>;
export type ScriptableAndArrayOptions<T, TContext> = { [P in keyof T]: ScriptableAndArray<T[P], TContext> };

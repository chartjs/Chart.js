import { createContext } from '../../helpers/helpers.options';

const context1 = createContext(null, { type: 'test1', parent: true });
const context2 = createContext(context1, { type: 'test2' });

const sSest: string = context1.type + context2.type;
const bTest: boolean = context1.parent && context2.parent;

// @ts-expect-error Property 'notThere' does not exist on type '{ type: string; parent: boolean; } & { type: string; }'
context2.notThere = '';

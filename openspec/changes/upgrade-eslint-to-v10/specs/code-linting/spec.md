## Purpose

How the source of Chart.js is linted: which files the lint command checks, which rules apply where, when the command fails, and how a finding is suppressed in place.

## ADDED Requirements

### Requirement: One lint command checks the code tree and the JavaScript examples in Markdown
The repository SHALL provide one lint command that checks the library source, the test suite and the documentation scripts, and the code examples in Markdown files fenced as `js` or `ts`, and that also runs the TypeScript type check. It SHALL NOT check build output, generated API pages, the React integration example, files under hidden directories, or Markdown examples fenced under any other label.

#### Scenario: Library and test code are linted
- **WHEN** a contributor runs `pnpm lint`
- **THEN** every JavaScript and TypeScript file of the library source, the test suite and the documentation scripts is linted
- **AND** the type check runs as before

#### Scenario: A js example in Markdown is linted
- **WHEN** a Markdown example fenced `js` contains `debugger;`
- **THEN** `pnpm lint` fails and reports the Markdown file at the example's line

#### Scenario: Examples under other labels are not linted
- **WHEN** a Markdown example fenced `javascript` or `jsx` contains `debugger;`
- **THEN** `pnpm lint` reports nothing for it

#### Scenario: Ignored files are not linted
- **WHEN** build output, generated API pages, the React integration example or a file under a hidden directory contains code that breaks a rule
- **THEN** `pnpm lint` reports nothing for it

### Requirement: Errors fail the command, warnings do not
The lint command SHALL exit non-zero when any linted file breaks a rule set to error, and SHALL print each finding with file, line, column and rule name. Findings of rules set to warning SHALL be printed without failing the command.

#### Scenario: An error fails the command
- **WHEN** a linted file contains a `debugger` statement
- **THEN** `pnpm lint` prints the finding and exits non-zero

#### Scenario: Warnings pass
- **WHEN** the only findings are over-complex functions, too many statements, explicit `any` or unused TypeScript variables
- **THEN** they are printed and `pnpm lint` passes

### Requirement: The code style is enforced, including TypeScript type syntax
The lint command SHALL enforce two-space indentation (`case` at the level of its `switch` in JavaScript, one level deeper in TypeScript), single quotes, semicolons (also after type aliases), no space before function parentheses, no spaces inside braces of values, spaces inside braces of type literals, and spaces around `|` in union types. Running it in fix mode SHALL rewrite the fixable findings.

#### Scenario: Spaced value braces fail
- **WHEN** library code contains `const o = { a: 1 };`
- **THEN** `pnpm lint` fails

#### Scenario: Type syntax is checked
- **WHEN** a type declaration contains `type P = {x: number}` without a semicolon
- **THEN** `pnpm lint` fails for the missing spaces and the missing semicolon

#### Scenario: Fix mode
- **WHEN** a contributor runs the lint command with `--fix`
- **THEN** the fixable findings are rewritten and no longer reported

### Requirement: Library, test and example code stay within ES2018
The lint command SHALL reject syntax and built-ins newer than ES2018 in the library source, the test suite and Markdown examples, except class fields, which the library already uses.

#### Scenario: Newer syntax and methods fail
- **WHEN** library code uses optional chaining, nullish coalescing, an optional catch binding, a BigInt literal, `export * as`, `Object.fromEntries`, `Promise.allSettled`, or a RegExp lookbehind, named group, `s` flag or property escape
- **THEN** `pnpm lint` fails with an ES-version finding

#### Scenario: Newer globals fail
- **WHEN** library code uses `globalThis`, `BigInt` or `WeakRef`
- **THEN** `pnpm lint` fails with an undefined-name finding

#### Scenario: Class fields pass
- **WHEN** library code declares `static id = 'bar';` in a class
- **THEN** no finding is reported

### Requirement: Markdown examples are linted as fragments
Markdown examples SHALL be checked without the undefined-name, unused-variable, unused-expression and final-newline rules, because examples are fragments of a larger program. Examples in the samples section MAY log to the console.

#### Scenario: Fragments pass
- **WHEN** a `js` example uses a variable it does not declare, or declares one it never uses
- **THEN** nothing is reported

#### Scenario: Console in samples
- **WHEN** an example in the samples section calls `console.log`
- **THEN** nothing is reported
- **AND** the same call in an example elsewhere fails the command

### Requirement: TypeScript rules apply only to TypeScript
TypeScript-specific rules SHALL apply to `.ts` and `.d.ts` files and to `ts` examples, and SHALL NOT apply to JavaScript.

#### Scenario: Unsafe types fail
- **WHEN** a TypeScript file uses `{}` or `Function` as a type without a suppression
- **THEN** `pnpm lint` fails

#### Scenario: JavaScript is not checked with TypeScript rules
- **WHEN** a JavaScript file calls `require()`
- **THEN** no TypeScript rule reports it

### Requirement: Test globals follow the test runner
Specs that run under Karma SHALL see the Jasmine globals and the test helpers. Specs that run under Vitest SHALL see the Vitest globals and SHALL NOT see the Jasmine globals.

#### Scenario: Karma spec
- **WHEN** a Karma spec uses `jasmine` or `acquireChart`
- **THEN** nothing is reported

#### Scenario: Vitest spec
- **WHEN** a Vitest spec uses `jasmine`
- **THEN** `pnpm lint` fails with an undefined-name finding
- **AND** `describe`, `expect` and `vi` are accepted

### Requirement: Inline suppressions keep working
`eslint-disable`, `eslint-disable-line` and `eslint-disable-next-line` comments SHALL suppress the named rules. A suppression that suppresses nothing SHALL be reported as a warning. A suppression that names a rule that does not exist SHALL fail the command.

#### Scenario: A suppression hides its finding
- **WHEN** a line carries `// eslint-disable-line no-unused-vars` over an unused parameter
- **THEN** it is not reported
- **AND** removing the comment makes it reported

#### Scenario: A suppression without a finding warns
- **WHEN** a suppression comment names a rule that reports nothing on that line
- **THEN** a warning is printed and the command passes

#### Scenario: An unknown rule fails
- **WHEN** a suppression comment names a rule that does not exist
- **THEN** `pnpm lint` fails

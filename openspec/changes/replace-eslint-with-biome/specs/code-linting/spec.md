## Purpose

How the source of Chart.js is linted and formatted: which files the lint command checks, which rules apply where, the enforced code format, when the command fails, and how a finding is suppressed in place.

## ADDED Requirements

### Requirement: One lint command checks the code tree
The repository SHALL provide one lint command that checks the library source, the test suite (specs, fixtures, helpers, integration checks and type tests), the documentation scripts, the documentation site's TypeScript and the root build and test configuration files, and that also runs the TypeScript type check. It SHALL NOT check Markdown files or the code examples inside them, the React integration example, build output or generated API pages.

#### Scenario: Library and test code are checked
- **WHEN** a contributor runs `pnpm lint`
- **THEN** every JavaScript and TypeScript file of the library source, the test suite, the documentation scripts, the documentation site and the root configuration files is checked
- **AND** the type check runs as before

#### Scenario: Markdown is not linted
- **WHEN** a Markdown file contains a JavaScript example that breaks a rule
- **THEN** `pnpm lint` reports nothing for it

#### Scenario: Ignored files are not checked
- **WHEN** the build output, the generated API pages or the React integration example contain code that breaks a rule
- **THEN** `pnpm lint` reports nothing for them

### Requirement: Errors fail the command, warnings do not
The lint command SHALL exit non-zero when any checked file breaks a rule set to error or is not in the enforced format, and SHALL print each finding with file, line, column and rule name. Findings of rules set to warning SHALL be printed without failing the command.

#### Scenario: An error
- **WHEN** a checked file contains a `debugger` statement
- **THEN** `pnpm lint` prints the file, line, column and rule and exits non-zero

#### Scenario: Only warnings
- **WHEN** the only findings are warnings, such as a function above the complexity or statement limit or an explicit `any` in TypeScript
- **THEN** `pnpm lint` prints them and passes

### Requirement: Code is in the formatter's format
Every checked file SHALL be exactly the formatter's output: two-space indentation, single quotes, semicolons, no trailing commas, no spaces inside object braces, and lines wrapped at 120 columns where the formatter can break them. The repository SHALL provide a format command that rewrites files into that output, and running it on formatted files SHALL change nothing.

#### Scenario: Unformatted code fails
- **WHEN** a checked file contains `const o = { a: 1 }` without the semicolon
- **THEN** `pnpm lint` fails with a formatting finding

#### Scenario: Format command
- **WHEN** a contributor runs `pnpm format` on that file
- **THEN** the file is rewritten to `const o = {a: 1};` and `pnpm lint` no longer reports it

#### Scenario: Idempotent
- **WHEN** `pnpm format` runs on a tree that `pnpm lint` passes
- **THEN** no file changes

### Requirement: The one-time reformat stays out of blame
The repository SHALL list the commit that reformatted the tree in a blame-ignore file, so that lines changed only by that commit are attributed to their earlier author.

#### Scenario: Blame across the reformat
- **WHEN** a contributor views blame on GitHub, or runs `git blame` with the repository's ignore-revs file configured, for a line the reformat only re-indented
- **THEN** the line shows the commit that last changed it before the reformat

### Requirement: Library and test code stay within the syntax the build does not lower
The lint command SHALL fail when library, test or documentation-script code uses the syntax or built-ins that the ES2018 guard of `eslint-plugin-es` rejects today, such as optional chaining, nullish coalescing, optional catch binding, BigInt, `globalThis` and newer regular-expression features, including in `RegExp` calls with literal arguments. It SHALL also fail on later syntax that the build does not lower: numeric separators, private class members, static blocks, logical assignment, `Object.hasOwn` and the regular-expression `d` flag. Code of the documentation site, which is not shipped, SHALL be exempt.

#### Scenario: Optional chaining in library code
- **WHEN** a library source file uses `a?.[b]`
- **THEN** `pnpm lint` fails with an ES-version finding

#### Scenario: Later syntax
- **WHEN** a library source file uses `1_000` or `a ||= b`
- **THEN** `pnpm lint` fails with an ES-version finding

#### Scenario: Regular expression built at run time
- **WHEN** a library source file calls `new RegExp('(?<=a)b')`
- **THEN** `pnpm lint` fails with an ES-version finding

#### Scenario: ES2018 code passes
- **WHEN** library code uses `a.b`, `a || b` or `catch (e)`
- **THEN** `pnpm lint` reports no ES-version finding

#### Scenario: Documentation site is exempt
- **WHEN** a documentation site file uses `a ?? b`
- **THEN** `pnpm lint` reports no ES-version finding for it

### Requirement: The ES2018 guard checks itself
The lint command SHALL fail when the ES2018 guard stops detecting a known sample of the syntax it rejects, or starts reporting a known ES2018 sample.

#### Scenario: Guard stops matching
- **WHEN** a tool upgrade makes the guard stop detecting optional chaining in its sample
- **THEN** `pnpm lint` fails

#### Scenario: Guard over-matches
- **WHEN** the guard reports `catch (e)` in its negative sample
- **THEN** `pnpm lint` fails

### Requirement: Test globals match the test runner
The lint command SHALL accept the globals of the runner each test file runs under, and SHALL report the other runner's globals as undeclared. It SHALL fail when a spec focuses a test or suite.

#### Scenario: Karma spec
- **WHEN** a Karma spec uses `describe`, `expect`, `spyOn`, `jasmine` or `acquireChart`
- **THEN** `pnpm lint` reports no undeclared variable

#### Scenario: Vitest spec
- **WHEN** a Vitest spec uses `vi`, `describe` or `createMockContext`
- **THEN** `pnpm lint` reports no undeclared variable
- **AND** **WHEN** it uses `jasmine`, **THEN** `pnpm lint` fails

#### Scenario: Focused test
- **WHEN** any spec uses `fit` or `fdescribe`
- **THEN** `pnpm lint` fails

### Requirement: Inline suppressions name a rule and a reason
A `biome-ignore` comment that names a rule and gives a reason SHALL suppress that rule's finding on the code directly below it. A suppression without a reason SHALL fail the lint command. A suppression that suppresses nothing SHALL be reported as a warning. Comments of the form `eslint-disable`, `eslint-disable-line` or `eslint-disable-next-line` SHALL have no effect.

#### Scenario: Suppressed finding
- **WHEN** a self-assignment is preceded by `// biome-ignore lint/correctness/noSelfAssign: assigning width resets the canvas`
- **THEN** `pnpm lint` reports nothing for it

#### Scenario: Reason missing
- **WHEN** the same comment has no reason
- **THEN** `pnpm lint` fails

#### Scenario: ESLint comment
- **WHEN** the self-assignment carries only `// eslint-disable-line no-self-assign`
- **THEN** `pnpm lint` reports the self-assignment

### Requirement: Lint leaves no state behind
The lint command SHALL write no cache file and SHALL need no ESLint installation for the library package.

#### Scenario: No cache file
- **WHEN** a contributor runs `pnpm lint` in a clean checkout
- **THEN** `git status` shows no new file

#### Scenario: No ESLint dependency
- **WHEN** a contributor asks pnpm why `eslint` is installed for the library package
- **THEN** pnpm reports that it is not

## Purpose

How the source of Chart.js is linted: which files the lint command checks, which rules apply where, when the command fails, and how a finding is suppressed in place.

## ADDED Requirements

### Requirement: One lint command checks the code tree
The repository SHALL provide one lint command that checks the library source, the test suite (specs, fixtures, helpers, integration checks and type tests) and the documentation scripts, and that also runs the TypeScript type check. It SHALL NOT check Markdown files or the code examples inside them, the React integration example, or files the repository ignores (build output, generated API pages, generated type tests).

#### Scenario: Library and test code are linted
- **WHEN** a contributor runs `pnpm lint`
- **THEN** every JavaScript and TypeScript file of the library source, the test suite and the documentation scripts is linted
- **AND** the type check runs as before

#### Scenario: Markdown is not linted
- **WHEN** a Markdown file contains a JavaScript example that breaks a rule
- **THEN** `pnpm lint` reports nothing for it

#### Scenario: Ignored files are not linted
- **WHEN** the build output, the generated API pages or the React integration example contain code that breaks a rule
- **THEN** `pnpm lint` reports nothing for them

### Requirement: Errors fail the command, warnings do not
The lint command SHALL exit non-zero when any linted file breaks a rule set to error, and SHALL print each finding with file, line, column and rule name. Findings of rules set to warning SHALL be printed without failing the command.

#### Scenario: An error
- **WHEN** a linted file contains a `debugger` statement
- **THEN** `pnpm lint` prints the file, line, column and rule and exits non-zero

#### Scenario: Only warnings
- **WHEN** the only findings are warnings, such as a function above the complexity limit or an explicit `any` in TypeScript
- **THEN** `pnpm lint` prints them and passes

### Requirement: The code style is enforced
The lint command SHALL enforce the repository's code style: two-space indentation with `case` labels at the `switch` indentation in JavaScript and one level deeper in TypeScript, single quotes, semicolons, no space before a function's parentheses, no spaces inside object braces in values, and spaces inside braces of TypeScript type literals. The style SHALL also apply to TypeScript type syntax. Fixable style findings SHALL be rewritten in place by the lint command's fix mode.

#### Scenario: Value object spacing
- **WHEN** library code contains `const o = { a: 1 };`
- **THEN** `pnpm lint` fails with a spacing finding

#### Scenario: Type literal spacing
- **WHEN** a type declaration contains `type P = {x: number};`
- **THEN** `pnpm lint` fails with a spacing finding

#### Scenario: Type alias semicolon
- **WHEN** a type declaration ends a type alias without a semicolon
- **THEN** `pnpm lint` fails

#### Scenario: Fix mode
- **WHEN** a contributor runs the lint command with `--fix` on a file with style findings
- **THEN** the fixable findings are rewritten in place and no longer reported

### Requirement: Library and test code stay within ES2018 syntax
The lint command SHALL fail when library or test code uses syntax or built-ins newer than ES2018 that the build does not lower (optional chaining, nullish coalescing, optional catch binding, BigInt, `globalThis`, `export * as`, `Object.fromEntries`, `Promise.allSettled`, newer regular-expression features). Code of the documentation site, which is not shipped, SHALL be exempt.

#### Scenario: Optional chaining in library code
- **WHEN** a library source file uses `a?.b`
- **THEN** `pnpm lint` fails with an ES-version finding

#### Scenario: Newer built-ins in library code
- **WHEN** a library source file uses `Object.fromEntries`, `globalThis`, or a `RegExp` constructor with a lookbehind, a named group or the `s` flag
- **THEN** `pnpm lint` fails with an ES-version finding for each

#### Scenario: Optional chaining in the documentation site
- **WHEN** a documentation site file uses `a?.b`
- **THEN** `pnpm lint` reports no ES-version finding for it

### Requirement: Inline suppressions keep working
A comment of the form `eslint-disable`, `eslint-disable-line` or `eslint-disable-next-line` that names a rule, including names with the `@typescript-eslint/` prefix, SHALL suppress that rule's findings where it applies, as it did before the switch.

#### Scenario: Suppressed unused parameter
- **WHEN** a method has an unused parameter and the line carries `// eslint-disable-line no-unused-vars`
- **THEN** `pnpm lint` reports no unused-variable finding for that line

#### Scenario: Comment removed
- **WHEN** the same comment is removed
- **THEN** `pnpm lint` reports the unused parameter

### Requirement: Lint leaves no state behind
The lint command SHALL write no cache file and SHALL need no ESLint installation for the library package.

#### Scenario: No cache file
- **WHEN** a contributor runs `pnpm lint` in a clean checkout
- **THEN** `git status` shows no new file

#### Scenario: No ESLint dependency
- **WHEN** a contributor asks pnpm why `eslint` is installed for the library package
- **THEN** pnpm reports that it is not

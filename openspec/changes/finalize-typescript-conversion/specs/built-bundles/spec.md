## Purpose

What the built JavaScript bundles contain and what their source maps point at.

## ADDED Requirements

### Requirement: Converting a module to TypeScript does not change the bundles

Converting a module from JavaScript to TypeScript SHALL leave the code of the ESM, CJS, UMD and helpers bundles unchanged, except for explicit `return undefined` or `return;` statements and restructured switch fallthroughs, which behave as before. Every file name under `dist/` that the previous build had SHALL still exist.

#### Scenario: Construction sets the same own properties

- **WHEN** a chart, controller, element or scale is constructed from a bundle built after a module was converted
- **THEN** its own properties have the same names, order and values as before, and no property with the value `undefined` is added

#### Scenario: A subclass keeps a field set during construction

- **WHEN** a custom controller extends a built-in one and sets a field in `initialize()`, which the base constructor calls
- **THEN** the field keeps that value after construction

### Requirement: Source maps point at the TypeScript sources

The source maps of the bundles SHALL list each converted module by its `.ts` path, with its TypeScript text.

#### Scenario: The animator's source

- **WHEN** a consumer opens `chart.js.map` after the animator is converted
- **THEN** it lists `src/core/core.animator.ts` and its TypeScript text

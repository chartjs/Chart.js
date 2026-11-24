## Purpose

How a legend item's symbol and text are styled.

## ADDED Requirements

### Requirement: Vertical offset of the symbol

The legend SHALL move each item's symbol, box or point style, down by `labels.boxYOffset` pixels (default 0) and SHALL NOT move its text.

#### Scenario: Offset symbol

- **WHEN** `labels.boxYOffset` is 2
- **THEN** every symbol is drawn 2 pixels lower than without the option
- **AND** the text is drawn where it was

### Requirement: Text decoration

A legend item SHALL be drawn with its `textDecoration`: `'line-through'`, `'underline'` or `'none'`. When an item has no `textDecoration`, a hidden item SHALL be struck through and a visible item SHALL have no decoration, as before. The decoration line SHALL be `labels.decorationWidth` pixels wide (default 2).

#### Scenario: Default decoration

- **WHEN** a dataset is hidden and its item has no `textDecoration`
- **THEN** its text is struck through with a line 2 pixels wide

#### Scenario: Underline on hover

- **WHEN** `onHover` sets the hovered item's `textDecoration` to `'underline'` and the chart is drawn
- **THEN** that item's text is underlined

#### Scenario: No strike-through

- **WHEN** `generateLabels` returns items with `textDecoration: 'none'`
- **THEN** hidden items are not struck through

#### Scenario: Thin decoration

- **WHEN** `labels.decorationWidth` is 1
- **THEN** the decoration line is 1 pixel wide

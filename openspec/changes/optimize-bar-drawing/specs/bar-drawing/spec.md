## Purpose

How a bar is painted: which areas its border and background cover, and how the outer edge of a bordered bar is antialiased.

## ADDED Requirements

### Requirement: The border and background cover the bar's areas

A bar's border and background SHALL cover the same areas for every combination of per-side border widths, skipped borders, corner radii and inflate amount. Only edge antialiasing MAY differ between ways of painting them.

#### Scenario: A bar with a border skipped at the base

- **WHEN** a vertical bar with `borderWidth: 2` and `borderSkipped: 'start'` is drawn
- **THEN** the border covers the top, left and right sides and not the base
- **THEN** the background covers the inner area, grown by the inflate amount on the bordered sides only

#### Scenario: A bar without a border

- **WHEN** a bar with `borderWidth: 0` and `borderRadius: 0` is drawn
- **THEN** its image matches the existing reference images within their tolerances

### Requirement: The outer edge of a bordered bar is antialiased once

The outer edge of a bar with a border SHALL be antialiased once, the same as the edge of a bar without a border. Drawing a bar SHALL NOT change the context's clip region or transform.

#### Scenario: Drawing a bordered bar sets no clip

- **WHEN** a bar with a border is drawn
- **THEN** no clip region is set for the bar, and its outer edge is antialiased by its own fill only

## Purpose

How a bar is painted: which areas its border and background cover, how their edges are antialiased, and what the canvas context holds after bars are drawn.

## ADDED Requirements

### Requirement: The border and background cover the bar's areas

A bar's border and background SHALL cover the same areas for every combination of per-side border widths, skipped borders, corner radii and inflate amount. Only edge antialiasing MAY differ between ways of painting them.

#### Scenario: A bar with a border skipped at the base

- **WHEN** a vertical bar with `borderWidth: 2` and `borderSkipped: 'start'` is drawn
- **THEN** the border covers the top, left and right sides and not the base, and the background covers the inner area, grown by the inflate amount on the bordered sides only

#### Scenario: A bar without a border

- **WHEN** a bar with `borderWidth: 0` and `borderRadius: 0` is drawn
- **THEN** its image matches the existing reference images within their tolerances

### Requirement: The outer edge of a bordered bar is antialiased once

The outer edge of a bar with a border SHALL be antialiased once, the same as the edge of a bar without a border.

#### Scenario: Stacked bordered segments

- **WHEN** stacked bars with a border and `borderSkipped: 'middle'` are drawn
- **THEN** no light seam shows where two segments meet

#### Scenario: Drawing a bordered bar sets no clip

- **WHEN** a bar with a border is drawn
- **THEN** no clip region is set for the bar

### Requirement: Drawing a dataset leaves the context as it was

After a dataset is drawn, the context's fill style, clip region and transform SHALL be what they were before, whether the dataset clip is on or off.

#### Scenario: A dataset with the clip off

- **WHEN** a dataset with `clip: false` is drawn and its controller changes `fillStyle`
- **THEN** a plugin's `afterDatasetDraw` sees the fill style the context had before the dataset was drawn

#### Scenario: A bar drawn outside a chart draw

- **WHEN** code calls a bar element's `draw(ctx)` directly
- **THEN** the clip region and transform are unchanged, and the fill style is the bar's last fill colour

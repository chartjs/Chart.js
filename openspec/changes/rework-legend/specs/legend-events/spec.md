## Purpose

Which pointer events run the legend's and the chart's click, hover and leave callbacks.

## ADDED Requirements

### Requirement: One press runs onClick once

A press and release SHALL run the legend's `onClick` and the chart's `onClick` once. A `mouseup` (including one mapped from `touchend` or `pointerup`) SHALL count as a click only when `click` is not among the events that the chart or plugin listens to. For the chart's `onClick`, `click` and `contextmenu` SHALL always count. For the legend's `onClick`, `click` SHALL always count and `contextmenu` SHALL never count.

#### Scenario: Both click and mouseup listened to

- **WHEN** the chart's `events` include `click` and `mouseup`, and the user clicks a legend item
- **THEN** the legend's `onClick` runs once

#### Scenario: Only mouseup listened to

- **WHEN** the chart's `events` include `mouseup` but not `click`, and the user releases the pointer on a legend item
- **THEN** the legend's `onClick` runs once

#### Scenario: Right-click on a legend item

- **WHEN** the chart's `events` include `contextmenu`, and the user right-clicks a legend item
- **THEN** the legend's `onClick` does not run

#### Scenario: Update after a click

- **WHEN** the chart's `events` include `click` and `mouseup`, the user clicks a data element, and then `update()` is called
- **THEN** the chart's `onClick` has run once in total

#### Scenario: Chart onClick

- **WHEN** the chart's `events` include `click` and `mouseup`, and the user clicks a data element
- **THEN** the chart's `onClick` runs once

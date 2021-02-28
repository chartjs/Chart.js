---
title: Interactions
---

Namespace: `options.interaction`, the global interaction configuration is at `Chart.defaults.interaction`. To configure which events trigger chart interactions, see [events](events.md#events).

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `mode` | `string` | `'nearest'` | Sets which elements appear in the interaction. See [Interaction Modes](modes.md#interaction-modes) for details.
| `intersect` | `boolean` | `true` | if true, the interaction mode only applies when the mouse position intersects an item on the chart.
| `axis` | `string` | `'x'` | Can be set to `'x'`, `'y'`, or `'xy'` to define which directions are used in calculating distances. Defaults to `'x'` for `'index'` mode and `'xy'` in `dataset` and `'nearest'` modes.

By default, these options apply to both the hover and tooltip interactions. The same options can be set in the `options.hover` namespace, in which case they will only affect the hover interaction. Similarly, the options can be set in the `options.plugins.tooltip` namespace to independently configure the tooltip interactions.

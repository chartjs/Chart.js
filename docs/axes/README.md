# Axes

Axes are an integral part of a chart. They are used to determine how data maps to a pixel value on the chart. In a cartesian chart, there is 1 or more X axis and 1 or more Y axis to map points onto the 2 dimensional canvas. These axes are know as ['cartesian axes'](./cartesian/README.md#cartesian-axes).

In a radial chart, such as a radar chart or a polar area chart, there is a single axis that maps points in the angular and radial directions. These are known as ['radial axes'](./radial/README.md#radial-axes).

Scales in Chart.js >V2.0 are significantly more powerful, but also different than those of v1.0.
* Multiple X & Y axes are supported.
* A built-in label auto-skip feature detects would-be overlapping ticks and labels and removes every nth label to keep things displaying normally.
* Scale titles are supported
* New scale types can be extended without writing an entirely new chart type

# Common Configuration

The following properties are common to all axes provided by Chart.js

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `display` | `Boolean` | `true` | If set to `false` the axis is hidden from view. Overrides *gridLines.display*, *scaleLabel.display*, and *ticks.display*.
| `callbacks` | `Object` | | Callback functions to hook into the axis lifecycle. [more...](#callbacks)
| `weight` | `Number` | `0` | The weight used to sort the axis. Higher weights are further away from the chart area.

## Callbacks
There are a number of config callbacks that can be used to change parameters in the scale at different points in the update process.

| Name | Arguments | Description
| ---- | --------- | -----------
| `beforeUpdate` | `axis` | Callback called before the update process starts.
| `beforeSetDimensions` | `axis` | Callback that runs before dimensions are set. 
| `afterSetDimensions` | `axis` | Callback that runs after dimensions are set.
| `beforeDataLimits` | `axis` | Callback that runs before data limits are determined.
| `afterDataLimits` | `axis` | Callback that runs after data limits are determined.
| `beforeBuildTicks` | `axis` | Callback that runs before ticks are created.
| `afterBuildTicks` | `axis` | Callback that runs after ticks are created. Useful for filtering ticks.
| `beforeTickToLabelConversion` | `axis` | Callback that runs before ticks are converted into strings.
| `afterTickToLabelConversion` | `axis` | Callback that runs after ticks are converted into strings. 
| `beforeCalculateTickRotation` | `axis` | Callback that runs before tick rotation is determined.
| `afterCalculateTickRotation` | `axis` | Callback that runs after tick rotation is determined.
| `beforeFit` | `axis` | Callback that runs before the scale fits to the canvas. 
| `afterFit` | `axis` | Callback that runs after the scale fits to the canvas. 
| `afterUpdate` | `axis` | Callback that runs at the end of the update process.

## Updating Axis Defaults

The default configuration for a scale can be easily changed using the scale service. All you need to do is to pass in a partial configuration that will be merged with the current scale default configuration to form the new default.

For example, to set the minimum value of 0 for all linear scales, you would do the following. Any linear scales created after this time would now have a minimum of 0.

```javascript
Chart.scaleService.updateScaleDefaults('linear', {
    ticks: {
        min: 0
    }
});
```

## Creating New Axes
To create a new axis, see the [developer docs](../developers/axes.md).

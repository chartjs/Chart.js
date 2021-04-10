# Data Decimation

The decimation plugin can be used with line charts to automatically decimate data at the start of the chart lifecycle. Before enabling this plugin, review the [requirements](#requirements) to ensure that it will work with the chart you want to create.

## Configuration Options

Namespace: `options.plugins.decimation`, the global options for the plugin are defined in `Chart.defaults.plugins.decimation`.

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `enabled` | `boolean` | `false` | Is decimation enabled?
| `algorithm` | `string` | `'min-max'` | Decimation algorithm to use. See the [more...](#decimation-algorithms)
| `samples` | `number` | | If the `'lttb'` algorithm is used, this is the number of samples in the output dataset. Defaults to the canvas width to pick 1 sample per pixel.

## Decimation Algorithms

Decimation algorithm to use for data. Options are:

* `'lttb'`
* `'min-max'`

### Largest Triangle Three Bucket (LTTB) Decimation

[LTTB](https://github.com/sveinn-steinarsson/flot-downsample) decimation reduces the number of data points significantly. This is most useful for showing trends in data using only a few data points.

### Min/Max Decimation

[Min/max](https://digital.ni.com/public.nsf/allkb/F694FFEEA0ACF282862576020075F784) decimation will preserve peaks in your data but could require up to 4 points for each pixel. This type of decimation would work well for a very noisy signal where you need to see data peaks.

## Requirements

To use the decimation plugin, the following requirements must be met:

1. The dataset must have an [`indexAxis`](../charts/line.md#general) of `'x'`
2. The dataset must be a line
3. The X axis for the dataset must be either a [`'linear'`](../axes/cartesian/linear.md) or [`'time'`](../axes/cartesian/time.md) type axis
4. Data must not need parsing, i.e. [`parsing`](../general/data-structures.md#dataset-configuration) must be `false`
5. The dataset object must be mutable. The plugin stores the original data as `dataset._data` and then defines a new `data` property on the dataset.

## Related Samples

* [Data Decimation Sample](../samples/advanced/data-decimation)

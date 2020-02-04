# Animations

Chart.js animates charts out of the box. A number of options are provided to configure how the animation looks and how long it takes.

## Animation Configuration

The following animation options are available. The global options for are defined in `Chart.defaults.animation`.

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `duration` | `number` | `1000` | The number of milliseconds an animation takes.
| `easing` | `string` | `'easeOutQuart'` | Easing function to use. [more...](#easing)
| `debug` | `boolean` | `undefined` | Running animation count + FPS display in upper left corner of the chart.
| `onProgress` | `function` | `null` | Callback called on each step of an animation. [more...](#animation-callbacks)
| `onComplete` | `function` | `null` | Callback called when all animations are completed. [more...](#animation-callbacks)
| `delay` | `number` | `undefined` | Delay before starting the animations.
| `loop` | `boolean` | `undefined` | If set to `true`, loop the animations loop endlessly.
| `type` | `string` | `typeof property` | Type of property, determines the interpolator used. Possible values: `'number'`, '`color`'.
| `from`  | <code>number&#124;Color</code> | `undefined` | Start value for the animation. Current value is used when `undefined`
| `active` | `object` | `{ duration: 400 }` | Option overrides for `active` animations (hover)
| `resize` | `object` | `{ duration: 0 }` | Option overrides for `resize` animations.
| [property] | `object` | `undefined` | Option overrides for [property].
| [collection] | `object` | [defaults...](#default-collections) | Option overrides for multiple properties, identified by `properties` array.
| [mode] | `object` | [defaults...](#default-modes) | Option overrides for update mode. Core modes: `'active'`, `'hide'`, `'reset'`, `'resize'`, `'show'`. A custom mode can be used by passing a custom `mode` to [update](../developers/api.md#updatemode)

### Default collections

| Name | Option | Value
| ---- | ------ | -----
| `numbers` | `type` | `'number'`
| | `properties` | `['x', 'y', 'borderWidth', 'radius', 'tension']`
| `colors` | `type` | `'color'`
| | `properties` | `['borderColor', 'backgroundColor']`

Direct property configuration overrides configuration of same property in a collection.

These defaults can be overridden in `options.animation` and `dataset.animation`.

### Default modes

| Mode | Option | Value
| -----| ------ | -----
| active | duration | 400
| resize | duration | 0
| show | colors | `{ type: 'color', properties: ['borderColor', 'backgroundColor'], from: 'transparent' }`
| | visible | `{ type: 'boolean', duration: 0 }`
| hide | colors | `{ type: 'color', properties: ['borderColor', 'backgroundColor'], to: 'transparent' }`
| | visible | `{ type: 'boolean', easing: 'easeInExpo' }`

## Easing

Available options are:

* `'linear'`
* `'easeInQuad'`
* `'easeOutQuad'`
* `'easeInOutQuad'`
* `'easeInCubic'`
* `'easeOutCubic'`
* `'easeInOutCubic'`
* `'easeInQuart'`
* `'easeOutQuart'`
* `'easeInOutQuart'`
* `'easeInQuint'`
* `'easeOutQuint'`
* `'easeInOutQuint'`
* `'easeInSine'`
* `'easeOutSine'`
* `'easeInOutSine'`
* `'easeInExpo'`
* `'easeOutExpo'`
* `'easeInOutExpo'`
* `'easeInCirc'`
* `'easeOutCirc'`
* `'easeInOutCirc'`
* `'easeInElastic'`
* `'easeOutElastic'`
* `'easeInOutElastic'`
* `'easeInBack'`
* `'easeOutBack'`
* `'easeInOutBack'`
* `'easeInBounce'`
* `'easeOutBounce'`
* `'easeInOutBounce'`

See [Robert Penner's easing equations](http://robertpenner.com/easing/).

## Animation Callbacks

The `onProgress` and `onComplete` callbacks are useful for synchronizing an external draw to the chart animation. The callback is passed following object:

```javascript
{
    // Chart object
    chart: Chart,

    // Number of animations still in progress
    currentStep: number,

    // Total number of animations at the start of current animation
    numSteps: number,
}
```

The following example fills a progress bar during the chart animation.

```javascript
var chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        animation: {
            onProgress: function(animation) {
                progress.value = animation.animationObject.currentStep / animation.animationObject.numSteps;
            }
        }
    }
});
```

Another example usage of these callbacks can be found on [Github](https://github.com/chartjs/Chart.js/blob/master/samples/advanced/progress-bar.html): this sample displays a progress bar showing how far along the animation is.

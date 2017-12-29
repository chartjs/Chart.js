# HTML Legend Configuration

Sometimes you need a very complex legend. In these cases, it makes sense to generate an HTML legend. Charts provide a `generateLegend()` method on their prototype that returns an HTML string/ DOM node for the legend. This function is a wrapper for `chart.htmllegend.generate()`.

The output of `generateLegend()` is configurable. See the [Configuration options](#configuration-options) section below.

Without any configuration options the `generateLegend()` will output legacy `'HTML'` output. Whenever the `options.htmllegend` is set, the default output will become `'DOM'`, which generates a DOM node.

Note that by default the HTML legend is not called automatically and you will have to call `generateLegend()` yourself. By setting the `target` option however the legend will be automatically inserted.

When these configuration options don't suffice, you can set the `options.htmllegend` or `options.htmllegend.callback` property with your own function, to configure how this legend is generated.

```javascript
var chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        htmllegend: function(chart, options, optional) {
            // @param {Object} chart - The chart object.
            // @param {Object} options - The chart.options.htmllegend options.
            // @param {Array} optional - optional arguments your callback needs.
            // Return the HTML string or DOM node here.
        }
    }
});
var legend = chart.generateLegend(); // HTML legend
```

The html legend is configurable.

```javascript
var chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        htmllegend: {
            callback: function(chart, options, optional) {
                // Return the HTML string or DOM node here.
            }
        }
    }
});
```

## Configuration options

The HTML legend configuration is passed into the `options.htmllegend` namespace. The global options for the chart legend is defined in `Chart.defaults.global.htmllegend`.
The default legend options need to be configured in `options.legend` which will be used by the default callback function.

| Name | Type | Default | Description
| -----| ---- | --------| -----------
| `callback` | `Function` | | User-defined callback function. Doing so will ignore the `output`, `nodes` and `hiddenClass` options.
| `hiddenClass` | `String` | `'hidden'` | Class to set on hidden legend elements.
| `listeners` | `Function` / `Object` | | Listeners to bind to container element. See [Event listeners](#html-event-listeners) section below.
| `nodes` | `Object` | | See the [Legend Node Tags Configuration](#html-legend-node-tags-configuration) section below.
| `output` | `String` | `'HTML'` / `'DOM'` | By default the returned output is a HTML string. When a configuration is passed, the default will be a DOM node.
| `target` | `DOM node` | | When present the legend will be auto-generated on chart creation.

## HTML Legend Node Tags Configuration

| Name | Type | Default | Description
| -----| ---- | --------| -----------
| `container` | `String` / `Object` | `'ul'` | Container element [Tag Configuration](#html-tag-elements-configuration).
| `items` | `String` / `Object` | `'li'` | Items element [Tag Configuration](#html-tag-elements-configuration).
| `box` | `String` / `Object` | `'span'` | Box element [Tag Configuration](#html-tag-elements-configuration).
| `label` | `String` / `Object` | `'textnode'` | Label element [Tag Configuration](#html-tag-elements-configuration).

## HTML Tag Elements Configuration

| Name | Type | Default | Description
| -----| ---- | --------| -----------
| `tag` | `String` | `'div'` | HTML tag.
| `attributes` | `Object` | | HTML node attributes, like `id`, `style` (String / Object) and `classList` (String / Array). See the [examples](#html-legend-examples) section below.

The `attributes` values can contain certain escape-values, which will be set on generation; e.g. the default class `{chartId}-legend`, which will be replaced by `0-legend` for the first chart. Allowed escape values are:

| Name | Description
| -----| -----------
| `{chartId}` | The chart id.
| `{id}` | The legend item index. Only allowed for `items`, `box` and `label`.
| `{datesetIndex}` | The `legendItem.datasetIndex` value, might be `undefined`.
| `{index}` | The `legendItem.index` value, might be `undefined`.

## HTML event Listeners

The list of event listeners to bind to legend container, where the key is the event listener name and the value the listener function or object.
For Example `click: function(e) {}` or `click: {listener: function(e) {}, options: {passive: true}}`.
Listeners can only be bound when the returned output is a DOM node. The `htmllegend` triggers the `afterUpdate` event on the `container`-node.

| Name | Type | Default | Description
| -----| ---- | --------| -----------
| `listener` | `Function` | | The event function.
| `options` | `Object` | false | Options to be bound by addEventListener.

## HTML Legend Examples

Generate a basic (legacy) HTML Unordered List (UL) with `{chartId}-legend` class.

```javascript
var legend = chart.generateLegend();
document.getElementById('legend-container').innerHTML = legend;
```

This example would generate something like the following.

```html
<ul class="0-legend">
    <li><span style="background-color: red;"></span>First Item</li>
    <li><span style="background-color: green;"></span>Second Item</li>
    <li><span style="background-color: blue;"></span>Third Item</li>
</ul>
```

Generate a personalized HTML legend.

```javascript
var chart = new Chart(ctx, {
    type: 'bar',
    data: data,
    options: {
        htmllegend: {
            nodes: {
                container: { // object syntax
                    tag: 'div',
                    attributes: {
                        id: 'legend-{chartId}',
                        classList: ['chartjs-legend', '{chartId}-legend'] // pass multiple classes as array
                    }
                },
                items: 'div', // string syntax
                box: {
                    tag: 'span',
                    attributes: {
                        style: {
                            border: 'none' // remove the default border
                        }
                    }
                },
                label: {
                    tag: 'span',
                    attributes: {
                        classList: 'label'
                    }
                }
            },
            hiddenClass: 'notVisible',
            target: document.getElementById('legend-container') // auto-generate HTML legend after chart construction
        }
    }
});
```

This example would generate something like the following.
Passing a DOM node as the `target` option will auto-generate the legend on chart creation.

```html
<div id="legend-container">
    <div id="legend-0" class="chartjs-legend 0-legend">
        <div>
            <span style="background-color: red; border: medium none;"></span>
            <span class="label">First Item</span>
        </div>
        <div>
            <span style="background-color: green; border: medium none;"></span>
            <span class="label">Second Item</span>
        </div>
        <div class="notVisible">
            <span style="background-color: blue; border: medium none;"></span>
            <span class="label">Third Item</span>
        </div>
    </div>
</div>
```

Generate an interactive DOM node. For this to work the `output` option has to be cannot be set to `'HTML'`.

```javascript
function onClickCallback(event) {
    event = event || window.event;

    var target = event.target || event.srcElement;
    if (target.nodeName === 'UL') {
        return; // event has been fired on parent
    }

    // find a direct descendant from the parent element
    while (target && target.nodeName !== 'LI') {
        target = target.parentElement;
    }

    if (!target) {
      return; // something went wrong, no target found
    }

    var parent = target.parentElement;
    var chartId = parseInt(parent.classList[0].split('-')[0], 10);
    var chart = Chart.instances[chartId];
    var index = Array.prototype.slice.call(parent.children).indexOf(target);

    // invoke the ChartJS legend onClick event
    chart.legend.options.onClick.call(chart, event, chart.legend.legendItems[index]);

    var hidden = chart.legend.legendItems[index].hidden; // legend item has been updated
    target.classList.toggle('hidden', hidden);
}

var chart = new Chart(ctx, {
    type: 'bar',
    data: data,
    options: {
        htmllegend: {
            listeners: {
                click: onClickCallback
            }
        }
    }
});

// create the HTML legend and attach to target
var targetNode = document.getElementById('legend-container');
chart.generateLegend(legendNode); // create legend and attach to target

// or you could chose to have the legendNode returned and attach it later
var targetNode = document.getElementById('legend-container');
var legendNode = chart.generateLegend(); // create legend
targetNode.appendChild(legendNode); // attach to target
```

The above example isn't any different from the following.

```javascript
var chart = new Chart(ctx, {
    type: 'bar',
    data: data
});

var targetNode = document.getElementById('legend-container');
var legend = chart.generateLegend();
targetNode.innerHTML = legend;
targetNode.childNodes[0].addEventListener('click', onClickCallback, false);
```

## Styling HTML Legend

Style sheet configuration to style the default HTML legend.

```css
[class$="-legend"] {
    background-color: rgba(255, 255, 255, 0.55);
    border: 1px solid #666;
    color: #666;
    display: inline-block;
    font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
    font-size: 12px;
    list-style: none;
    margin: 0;
    padding: 5px 6px;
}
[class$="-legend"] > li {
    cursor: pointer;
    vertical-align: middle;
}
[class$="-legend"] > li.hidden {
    text-decoration: line-through;
}
[class$="-legend"] > li > span:first-child {
    background-clip: padding-box;
    box-sizing: border-box;
    display: inline-block;
    height: 14px;
    margin-right: 6px;
    width: 40px;
    vertical-align: middle;
}
```

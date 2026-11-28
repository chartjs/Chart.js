# HTML Legend

This example shows how to create a custom HTML legend using a plugin and connect it to the chart in lieu of the default on-canvas legend.  
For an html legend to work you need to place an empty div at your web page, like so: `<div id="legend-container"></div>`, and give the plugin's `container` option either that element or its ID.
When the chart is in a shadow root, pass the element: `document.getElementById` does not find elements inside a shadow root.

<div id="legend-container"></div>

```js chart-editor
// <block:plugin:0>
const getOrCreateLegendList = (chart, container) => {
  const legendContainer = typeof container === 'string'
    ? document.getElementById(container)
    : container;
  let listContainer = legendContainer.querySelector('ul');

  if (!listContainer) {
    listContainer = document.createElement('ul');
    listContainer.style.display = 'flex';
    listContainer.style.flexDirection = 'row';
    listContainer.style.margin = 0;
    listContainer.style.padding = 0;

    legendContainer.appendChild(listContainer);
  }

  return listContainer;
};

const htmlLegendPlugin = {
  id: 'htmlLegend',
  afterUpdate(chart, args, options) {
    const ul = getOrCreateLegendList(chart, options.container);

    // Remove old legend items
    while (ul.firstChild) {
      ul.firstChild.remove();
    }

    // Reuse the built-in legendItems generator
    const items = chart.options.plugins.legend.labels.generateLabels(chart);

    items.forEach(item => {
      const li = document.createElement('li');
      li.style.alignItems = 'center';
      li.style.cursor = 'pointer';
      li.style.display = 'flex';
      li.style.flexDirection = 'row';
      li.style.marginLeft = '10px';

      li.onclick = () => {
        const {type} = chart.config;
        if (type === 'pie' || type === 'doughnut') {
          // Pie and doughnut charts only have a single dataset and visibility is per item
          chart.toggleDataVisibility(item.index);
          chart.update();
        } else if (chart.isDatasetVisible(item.datasetIndex)) {
          // hide and show update the chart with the hide and show animations
          chart.hide(item.datasetIndex);
        } else {
          chart.show(item.datasetIndex);
        }
      };

      // Color box
      const boxSpan = document.createElement('span');
      boxSpan.style.background = item.fillStyle;
      boxSpan.style.borderColor = item.strokeStyle;
      boxSpan.style.borderWidth = item.lineWidth + 'px';
      boxSpan.style.display = 'inline-block';
      boxSpan.style.flexShrink = 0;
      boxSpan.style.height = '20px';
      boxSpan.style.marginRight = '10px';
      boxSpan.style.width = '20px';

      // Text
      const textContainer = document.createElement('p');
      textContainer.style.color = item.fontColor;
      textContainer.style.margin = 0;
      textContainer.style.padding = 0;
      textContainer.style.textDecoration = item.hidden ? 'line-through' : '';

      const text = document.createTextNode(item.text);
      textContainer.appendChild(text);

      li.appendChild(boxSpan);
      li.appendChild(textContainer);
      ul.appendChild(li);
    });
  }
};
// </block:plugin>

// <block:data:1>
const NUM_DATA = 7;
const NUM_CFG = {count: NUM_DATA, min: 0, max: 100};
const data = {
  labels: Utils.months({count: NUM_DATA}),
  datasets: [
    {
      label: 'Dataset: 1',
      data: Utils.numbers(NUM_CFG),
      borderColor: Utils.CHART_COLORS.red,
      backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
      fill: false,
    },
    {
      label: 'Dataset: 1',
      data: Utils.numbers(NUM_CFG),
      borderColor: Utils.CHART_COLORS.blue,
      backgroundColor: Utils.transparentize(Utils.CHART_COLORS.blue, 0.5),
      fill: false,
    },
  ],
};
// </block:data>

// <block:setup:2>
const config = {
  type: 'line',
  data: data,
  options: {
    plugins: {
      htmlLegend: {
        // The container to put the legend in: an element, or its ID
        container: 'legend-container',
      },
      legend: {
        display: false,
      }
    }
  },
  plugins: [htmlLegendPlugin],
};
// </block:setup>

module.exports = {
  actions: [],
  config: config,
};
```

## TypeScript

`htmlLegend` is not one of the built-in plugins, so TypeScript does not know its options. Declare them by [augmenting `PluginOptionsByType`](../../developers/plugins.md#typescript-typings), for example in a `.d.ts` file:

```ts
import type {ChartType} from 'chart.js';

declare module 'chart.js' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface PluginOptionsByType<TType extends ChartType> {
    htmlLegend?: {
      // The container to put the legend in: an element, or its ID
      container?: string | HTMLElement;
    };
  }
}
```

Keep the `TType` type parameter even though the options do not use it: every declaration of an interface must have the same type parameters, and TypeScript reports error TS2428 without it.

## Docs 
* [Data structures (`labels`)](../../general/data-structures.md)
* [Line](../../charts/line.md)
* [Legend](../../configuration/legend.md)
  * `display: false`
* [Plugins](../../developers/plugins.md)  

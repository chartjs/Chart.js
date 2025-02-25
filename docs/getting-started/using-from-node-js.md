# Using from Node.js

You can use Chart.js in Node.js for server-side generation of plots with help from an NPM package such as [node-canvas](https://github.com/Automattic/node-canvas) or [skia-canvas](https://skia-canvas.org/).

Sample usage:

```js
import {CategoryScale, Chart, LinearScale, LineController, LineElement, PointElement} from 'chart.js';
import {Canvas} from 'skia-canvas';
import fsp from 'node:fs/promises';

Chart.register([
  CategoryScale,
  LineController,
  LineElement,
  LinearScale,
  PointElement
]);

const canvas = new Canvas(400, 300);
const chart = new Chart(
  canvas, // TypeScript needs "as any" here
  {
    type: 'line',
    data: {
      labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
      datasets: [{
        label: '# of Votes',
        data: [12, 19, 3, 5, 2, 3],
        borderColor: 'red'
      }]
    }
  }
);
const pngBuffer = await canvas.toBuffer('png', {matte: 'white'});
await fsp.writeFile('output.png', pngBuffer);
chart.destroy();
```

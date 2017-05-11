<span id="yuan-xing"></span>
#### 原型方法

每种类型的图表你都能找到一些合适的原型方法，这些方法都是基于`Chart.js`实现的，以下我们以折线图为例

```javascript
// For example:
var myLineChart = new Chart(ctx, config);
```

##### .destroy()

删除已创建的图表实例，方法会清空图表对象以及对象绑定的事件监听方法。该方法必须在canvas复用之前调用

```javascript
// Destroys a specific chart instance
myLineChart.destroy();
```

##### .update(duration, lazy)

重新渲染图表以及图表数据

```javascript
// duration is the time for the animation of the redraw in milliseconds
// lazy is a boolean. if true, the animation can be interrupted by other animations
myLineChart.data.datasets[0].data[2] = 50; // Would update the first dataset's value of 'March' to be 50
myLineChart.update(); // Calling update now animates the position of March from 90 to 50.
```

##### .reset()

图表重置成动画渲染之前，接着会按`update`重新执行动画

```javascript
myLineChart.reset();
```

##### .render(duration, lazy)

重新渲染图表但不渲染数据

```javascript
// duration is the time for the animation of the redraw in milliseconds
// lazy is a boolean. if true, the animation can be interrupted by other animations
myLineChart.render(duration, lazy);
```

##### .stop()

暂停图表渲染，执行`.render()`重新渲染

```javascript
// Stops the charts animation loop at its current frame
myLineChart.stop();
// => returns 'this' for chainability
```

##### .resize()

手动更新图表的尺寸

```javascript
// Resizes & redraws to fill its container element
myLineChart.resize();
// => returns 'this' for chainability
```

##### .clear()

清空canvas对象

```javascript
// Will clear the canvas that myLineChart is drawn on
myLineChart.clear();
// => returns 'this' for chainability
```

##### .toBase64Image()

将当前canvas对象保存为base64编码的图片

```javascript
myLineChart.toBase64Image();
// => returns png data url of the image on the canvas
```

##### .generateLegend()

返回图例的HTML格式字符串，图例通过图例选项中的`legendCallback`选项生成

```javascript
myLineChart.generateLegend();
// => returns HTML string of a legend for this chart
```

##### .getElementAtEvent(e)

在图表实例中请求`getElementAtEvent(e)`方法，会返回处于同一事件位置的点参数

```javascript
canvas.onclick = function(evt){
    var activePoints = myLineChart.getElementsAtEvent(evt);
    // => activePoints is an array of points on the canvas that are at the same position as the click event.
};
```

##### .getDatasetAtEvent(e)

返回所有数据参数

```javascript
myLineChart.getDatasetAtEvent(e);
// => returns an array of elements
```

##### .getDatasetMeta(index)

查找匹配当前序列的数据集合，返回所有的元数据

```javascript
var meta = myChart.getDatasetMeta(0);
var x = meta.data[0]._model.x
```
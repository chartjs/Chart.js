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

<span id="wai-bu-ti-shi-xiang"></span>
#### 外部提示项

可以在全局或者图表配置中定义提示项

```javascript
var myPieChart = new Chart(ctx, {
    type: 'pie',
    data: data,
    options: {
        tooltips: {
            custom: function(tooltip) {
                // tooltip will be false if tooltip is not visible or should be hidden
                if (!tooltip) {
                    return;
                }

                // Otherwise, tooltip will be an object with all tooltip properties like:

                // tooltip.caretSize
                // tooltip.caretPadding
                // tooltip.chart
                // tooltip.cornerRadius
                // tooltip.fillColor
                // tooltip.font...
                // tooltip.text
                // tooltip.x
                // tooltip.y
                // tooltip.caretX
                // tooltip.caretY
                // etc...
            }
        }
    }
});
```

<span id="zi-ding-yi-zhou-xian"></span>
#### 自定义轴线类型

从`Chartjs 2.0`开始，轴线类型可以进行自定义扩展，需要继承自`Chart.Scale`

```javascript
var MyScale = Chart.Scale.extend({
    /* extensions ... */
});

// MyScale is now derived from Chart.Scale
```

当你自定义轴线时，首先需要在全局对象中进行注册。注册时将会采用默认配置，第一条参数是一个字符串标识符，以供后面调用使用。

```javascript
Chart.scaleService.registerScaleType('myScale', MyScale, defaultConfigObject);
```

使用自定义的轴线类型时，传自定义的字符串标识进行声明即可。

```javascript
var lineChart = new Chart(ctx, {
    data: data,
    type: 'line',
    options: {
        scales: {
            yAxes: [{
                type: 'myScale' // this is the same key that was passed to the registerScaleType function
            }]
        }
    }
})
```

##### 轴线属性

轴线实例有如下属性：

```javascript
{
    left: Number, // left edge of the scale bounding box
    right: Number, // right edge of the bounding box'
    top: Number,
    bottom: Number,
    width: Number, // the same as right - left
    height: Number, // the same as bottom - top

    // Margin on each side. Like css, this is outside the bounding box.
    margins: {
        left: Number,
        right: Number,
        top: Number,
        bottom: Number,
    },

    // Amount of padding on the inside of the bounding box (like CSS)
    paddingLeft: Number,
    paddingRight: Number,
    paddingTop: Number,
    paddingBottom: Number,
}
```

##### 轴线接口

自定义轴线必须实现以下接口：

```javascript
{
    // Determines the data limits. Should set this.min and this.max to be the data max/min
    determineDataLimits: function() {},

    // Generate tick marks. this.chart is the chart instance. The data object can be accessed as this.chart.data
    // buildTicks() should create a ticks array on the axis instance, if you intend to use any of the implementations from the base class
    buildTicks: function() {},

    // Get the value to show for the data at the given index of the the given dataset, ie this.chart.data.datasets[datasetIndex].data[index]
    getLabelForIndex: function(index, datasetIndex) {},

    // Get the pixel (x coordinate for horizontal axis, y coordinate for vertical axis) for a given value
    // @param index: index into the ticks array
    // @param includeOffset: if true, get the pixel halway between the given tick and the next
    getPixelForTick: function(index, includeOffset) {},

    // Get the pixel (x coordinate for horizontal axis, y coordinate for vertical axis) for a given value
    // @param value : the value to get the pixel for
    // @param index : index into the data array of the value
    // @param datasetIndex : index of the dataset the value comes from
    // @param includeOffset : if true, get the pixel halway between the given tick and the next
    getPixelForValue: function(value, index, datasetIndex, includeOffset) {}

    // Get the value for a given pixel (x coordinate for horizontal axis, y coordinate for vertical axis)
    // @param pixel : pixel value
    getValueForPixel: function(pixel) {}
}

```

以下选项也需要实现，但是基础类中已经实现了相关内容

```javascript
{
    // Transform the ticks array of the scale instance into strings. The default implementation simply calls this.options.ticks.callback(numericalTick, index, ticks);
    convertTicksToLabels: function() {},

    // Determine how much the labels will rotate by. The default implementation will only rotate labels if the scale is horizontal.
    calculateTickRotation: function() {},

    // Fits the scale into the canvas.
    // this.maxWidth and this.maxHeight will tell you the maximum dimensions the scale instance can be. Scales should endeavour to be as efficient as possible with canvas space.
    // this.margins is the amount of space you have on either side of your scale that you may expand in to. This is used already for calculating the best label rotation
    // You must set this.minSize to be the size of your scale. It must be an object containing 2 properties: width and height.
    // You must set this.width to be the width and this.height to be the height of the scale
    fit: function() {},

    // Draws the scale onto the canvas. this.(left|right|top|bottom) will have been populated to tell you the area on the canvas to draw in
    // @param chartArea : an object containing four properties: left, right, top, bottom. This is the rectangle that lines, bars, etc will be drawn in. It may be used, for example, to draw grid lines.
    draw: function(chartArea) {},
}
```

轴线实例核心还有一些实用的方法你可能会用到

```javascript
{
    // Returns true if the scale instance is horizontal
    isHorizontal: function() {},

    // Get the correct value from the value from this.chart.data.datasets[x].data[]
    // If dataValue is an object, returns .x or .y depending on the return of isHorizontal()
    // If the value is undefined, returns NaN
    // Otherwise returns the value.
    // Note that in all cases, the returned value is not guaranteed to be a Number
    getRightValue: function(dataValue) {},
}
```

<span id="zi-ding-yi-tu-biao"></span>
#### 自定义图表类型

`Chartjs 2.0`提出了controller的概念，

```javascript
Chart.controllers.MyType = Chart.DatasetController.extend({

});


// Now we can create a new instance of our chart, using the Chart.js API
new Chart(ctx, {
    // this is the string the constructor was registered at, ie Chart.controllers.MyType
    type: 'MyType',
    data: data,
    options: options
});
```

##### 数据组controller接口

```javascript
{
    // Create elements for each piece of data in the dataset. Store elements in an array on the dataset as dataset.metaData
    addElements: function() {},

    // Create a single element for the data at the given index and reset its state
    addElementAndReset: function(index) {},

    // Draw the representation of the dataset
    // @param ease : if specified, this number represents how far to transition elements. See the implementation of draw() in any of the provided controllers to see how this should be used
    draw: function(ease) {},

    // Remove hover styling from the given element
    removeHoverStyle: function(element) {},

    // Add hover styling to the given element
    setHoverStyle: function(element) {},

    // Update the elements in response to new data
    // @param reset : if true, put the elements into a reset state so they can animate to their final values
    update: function(reset) {},
}
```

以下选项可以选择性的实现

```javascript
{
    // Initializes the controller
    initialize: function(chart, datasetIndex) {},

    // Ensures that the dataset represented by this controller is linked to a scale. Overridden to helpers.noop in the polar area and doughnut controllers as these
    // chart types using a single scale
    linkScales: function() {},

    // Called by the main chart controller when an update is triggered. The default implementation handles the number of data points changing and creating elements appropriately.
    buildOrUpdateElements: function() {}
}
```
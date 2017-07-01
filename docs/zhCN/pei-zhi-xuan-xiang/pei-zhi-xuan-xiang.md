<span id="pei-zhi-xuan-xiang"></span>
#### 配置选项

Chart.js 提供了一系列选项用来配置创建的图表。这些选项可以通过创建图表时传入一个 options 对象进行配置，否则创建图表的时候将使用官方的全局配置。

<span id="tu-biao-shu-ju"></span>
#### 图表数据

为了描绘图表，需要传入一个包含所有必须数据的 data 对象，data 对象可以包含以下属性：

| 属性名    | 类型          | 描述 |
| -------  | ------------- | ----------- |
| datasets | Array[object] | 包含每一组数据。查看后面各种类型图表详细文档选择合适的选项 |
| labels   | Array[string] | 设置[轴线选项](zhou-xian-xuan-xiang/zhou-xian-xuan-xiang.md)|
| xLabels  | Array[string] | 设置水平轴选项 |
| yLabels  | Array[string] | 设置垂直轴选项 |

<span id="zi-ding-yi-xuan-xiang"></span>
#### 自定义选项创建图表

简单的给js构造器声明一个包含自定义配置信息的options对象即可创建自定义选项图表。如下示例创建了一个非响应的图表：

```javascript
var chartInstance = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        responsive: false
    }
});
```

<span id="quan-ju-pei-zhi"></span>
#### 全局配置

为了遵循[DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself)规范，Chart.js 1.0 版本中提成了这个概念，允许并且推荐修改所有类型图表都适用的配置选项，而不是为每一个实例单独修改配置，或者给特殊的实例也使用默认配置。

Chart.js 正确地将 options 对象和默认类型和轴线配置进行合并，这样你可以将个人图表配置写的尽可能地明确并且能改变相匹配的全局配置。全局选项定义为`Chart.defaults.global`。各种类型的图表默认配置将在之后详细介绍。

以下示例将在创建图表时将所有没有自定义 hover mode 的配置统一定义为 'nearest':

```javascript
Chart.defaults.global.hover.mode = 'nearest';

// Hover mode is set to nearest because it was not overridden here
var chartInstanceHoverModeNearest = new Chart(ctx, {
    type: 'line',
    data: data,
});

// This chart would have the hover mode that was passed in
var chartInstanceDifferentHoverMode = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        hover: {
            // Overrides the global setting
            mode: 'index'
        }
    }
})
```

##### 全局字体设置

如下有四种全局设置方式可以改变图表的所有字体。这四种选项将在`Chart.defaults.global`中进行定义:

| 选项名             | 类型   | 默认值     | 描述 |
| ----------------  | ------ | -------- | ----------- |
| defaultFontColor  | Color  | '#666'   | 文字默认颜色 |
| defaultFontFamily | String | "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif" | 文字默认字体 |
| defaultFontSize   | Number | 12 | 默认字号 单位px. 不适用于radialLinear scale point labels |
| defaultFontStyle  | String | 'normal' | 默认字体风格. 不适用于tooltip title, footer and chart title |

<span id="tong-yong-tu-biao-pei-zhi"></span>
#### 通用图表配置

以下选项适用于所有图表。它们可以在[全局配置](#quan-ju-pei-zhi)中进行设置，也可以作为`options`传给图表构造器。

| 选项名 | 类型 | 默认值 | 描述 
| --- | --- | --- | --- |
| responsive | Boolean | true | 自动调整图表大小 |
| responsiveAnimationDuration | Number | 0 | 自动调整图表大小动作持续时间（毫秒）|
| maintainAspectRatio | Boolean | true | 调整图表大小时保证长宽比不变 |
| events | Array[String] | ["mousemove", "mouseout", "click", "touchstart", "touchmove", "touchend"] | 图表监听事件 |
| onClick | Function | null | `mouseup`或`click`事件的回调动作 |
| legendCallback | Function | function (chart) { } | 接收图表配置生成图例，默认生成HTML字符串 |
| onResize | Function | null | 图表调整大小时触发 |

<span id="bu-ju-pei-zhi"></span>
#### 布局配置

布局配置选项通过`options.layout`命名空间进行传递。图表布局的全局选项在`Chart.defaults.global.layout`中定义：

| 选项名 | 类型 | 默认值 | 描述 
| --- | --- | --- | --- |
| padding | Number or Object | 0 | 定义图表的内边距。如果传进来`Number`，则默认`top`, `bottom`, `left`, `right`都为同一个值。如果传进来是一个对象，则`key`为`top`, `bottom`, `left`, `right`的值分别定义各个方向上的值 |

<span id="biao-ti-pei-zhi"></span>
#### 标题配置

标题配置选项通过`options.title`命名空间进行传递。标题配置的全局选项在`Chart.defaults.global.title`中定义：

| 选项名 | 类型 | 默认值 | 描述 
| --- | --- | --- | --- |
| display | Boolean | false | 图表是否显示标题 |
| position | String | 'top' | 标题所在方位，可以设置为`top`, `bottom`, `left`, `right` |
| fullWidth | Boolean | true | 宽度为canvas的百分百宽度 |
| fontSize | Number | 12 | 标题字体大小 |
| fontFamily | String | "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif" | 标题字体 |
| fontColor | Color | "#666" | 标题字体颜色 |
| fontStyle | String | 'bold' | 标题字体风格 |
| padding | Number | 10 | 标题上下内边距 |
| text | String | '' | 标题内容 |

##### 标题示例

以下示例将生成内容为"Custom Chart Title"的标题

```javascript
var chartInstance = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        title: {
            display: true,
            text: 'Custom Chart Title'
        }
    }
})
```

<span id="tu-li-pei-zhi"></span>
#### 图例配置

图例配置选项通过`options.legend`命名空间进行传递。图例配置的全局选项在`Chart.defaults.global.legend`中定义：

| 选项名 | 类型 | 默认值 | 描述 
| --- | --- | --- | --- |
| display | Boolean | true  | 是否显示图例 |
| position | String | 'top' | 图例所在方位，可以设置为`top`, `bottom`, `left`, `right` |
| fullWidth | Boolean | true | 宽度为canvas的百分百宽度 |
| onClick | Function | function(event, legendItem) {} | 当图例标签注册了`click`事件时点击图例触发 |
| onHover | Function | function(event, legendItem) {} | 当图例标签注册了`mousemove`事件时滑过图例触发 |
| labels | Object | - | 参考下面[图例标签配置](#tu-li-biao-qian) |
| reverse | Boolean | false | 逆序显示数据图例 |

<span id="tu-li-biao-qian"></span>
##### 图例标签配置

图例标签配置在上述图例配置中的`labels`选项中进行设置:

| 选项名 | 类型 | 默认值 | 描述 
| --- | --- | --- | --- |
| boxWidth | Number | 40 | 图例标签色块宽度 |
| fontSize | Number | 12 | 图例字体大小 |
| fontFamily | String | "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif" | 图例字体 |
| fontColor | Color | "#666" | 图例字体颜色 |
| fontStyle | String | 'normal' | 图例字体风格 |
| padding | Number | 10 | 图例色块间的边距 |
| generateLabels | Function | function(chart) { } | 定义生成图例，默认为文字+色块，更多信息参考[图例项样式](#tu-li-yang-shi) |
| filter | Function | null | 参考[图例项样式](#tu-li-yang-shi) |
| usePointStyle | Boolean | false | 设置标签样式为文字大小的`点`状 |

<span id="tu-li-yang-shi"></span>
##### 图例项样式

在上述图例标签配置中`labels.generateLabels`选项中进行设置，必须实现以下接口：

```javascript
{
    // 图例显示内容
    text: String,

    // 图例色块填充色
    fillStyle: Color,

    // 设置为true时图例上将显示删除线
    hidden: Boolean,

    // For box border. See https://developer.mozilla.org/en/docs/Web/API/CanvasRenderingContext2D/lineCap
    lineCap: String,

    // For box border. See https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash
    lineDash: Array[Number],

    // For box border. See https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineDashOffset
    lineDashOffset: Number,

    // For box border. See https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineJoin
    lineJoin: String,

    // 容器边框宽度
    lineWidth: Number,

    // 容器删除色
    strokeStyle: Color

    // 图例块点状风格 (仅当`usePointStyle`设置为`true`时生效)
    pointStyle: String
}
```
##### 示例

以下示例将设置图表的图例文字颜色为红色：

```javascript
var chartInstance = new Chart(ctx, {
    type: 'bar',
    data: data,
    options: {
        legend: {
            display: true,
            labels: {
                fontColor: 'rgb(255, 99, 132)'
            }
        }
}
});
```

<span id="ti-shi-xiang-pei-zhi"></span>
#### 提示项配置

提示项配置选项通过`options.tooltips`命名空间进行传递。提示项配置的全局选项在`Chart.defaults.global.tooltips`中定义：

| 选项名 | 类型 | 默认值 | 描述 
| --- | --- | --- | --- |
| enabled | Boolean | true | 是否显示提示 |
| custom | Function | null | 参考后文 |
| mode | String | 'nearest' | 提示项样式 |
| intersect | Boolean | true | 设置为`true`时将获得焦点的时候显示提示 |
| position | String | 'average' | 提示项显示区域 `average`, `neares` |
| itemSort | Function | undefined | 提示项排序 |
| filter | Function | undefined | 提示项过滤器 |
| backgroundColor | Color | 'rgba(0,0,0,0.8)' | 提示项背景色 |
| titleFontFamily | String | "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif" | 提示项标题字体 |
| titleFontSize | Number | 12 | 提示项标题字体大小 |
| titleFontStyle | String | "bold" | 提示项标题字体风格 |
| titleFontColor | Color | "#fff" | 提示项标题字体颜色 |
| titleSpacing | Number | 2 | 提示项标题字间距 |
| titleMarginBottom | Number | 6 | 提示项标题下外边距 |
| bodyFontFamily | String | "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif" | 提示项内容字体 |
| bodyFontSize | Number | 12 | 提示项内容字体大小 |
| bodyFontStyle | String | "normal" | 提示项内容字体风格 |
| bodyFontColor | Color | "#fff" | 提示项内容字体颜色 |
| bodySpacing | Number | 2 | 提示项内容字间距 |
| footerFontFamily | String | "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif" | 提示项页尾字体 |
| footerFontSize | Number | 12 | 提示项页尾字体大小 |
| footerFontStyle | String | "bold" | 提示项页尾字体风格 |
| footerFontColor | Color | "#fff" | 提示项页尾字体颜色 |
| footerSpacing | Number | 2 | 提示项页尾字间距 |
| footerMarginTop | Number | 6 | 提示项页尾上外边距 |
| xPadding | Number | 6 | 提示项左右边距 |
| yPadding | Number | 6 | 提示项上下边距 |
| caretSize | Number | 5 | 箭头符大小 |
| cornerRadius | Number | 6 | 提示项边角弧度 |
| multiKeyBackground | Color | "#fff" | 多个提示项重叠时背景色 |
| displayColors | Boolean | true | 设置`true`时提示项显示色块 |
| callbacks | Object | | 查看以下回调部分 |

##### 提示项回调

提示项标签配置由提示项配置中的`callbacks`选项声明，提示项配置为文本提供了以下几种方式的回调：

| 回调名 | 参数 | 描述 |
| ----- | --- | ---- |
| beforeTitle | Array[tooltipItem], data | 在标题前渲染的内容 |
| title | Array[tooltipItem], data | 标题 |
| afterTitle | Array[tooltipItem], data	 | 在标题之后渲染的内容 |
| beforeBody | Array[tooltipItem], data | 在正文内容前渲染的内容 |
| beforeLabel | tooltipItem, data | 在标签前渲染的内容 |
| label | tooltipItem, data | 标签 |
| labelColor | tooltipItem, chartInstance | 返回提示项的颜色对象，有`borderColor `和`backgroundColor `两个属性 |
| afterLabel | tooltipItem, data | 在标签之后渲染的内容 |
| afterBody | Array[tooltipItem], data | 在正文内容之后渲染的内容 |
| beforeFooter | Array[tooltipItem], data | 在页尾前渲染的内容 |
| footer | Array[tooltipItem], data | 页尾 |
| afterFooter | Array[tooltipItem], data | 在页尾后渲染的内容 |
| dataPoints | Array[tooltipItem] | 列出匹配点的信息 |

##### 提示项接口

提示项配置实现了以下接口：

```javascript
{
    // 提示项垂直方向的值
    xLabel: String,

    // 提示项水平方向的值
    yLabel: String,

    // 数据组序号
    datasetIndex: Number,

    // 数据在数据组中的序号
    index: Number,

    // 匹配点的x坐标
    x: Number,

    // 匹配点的y坐标
    y: Number,
}
```

<span id="xuan-ting-pei-zhi"></span>
#### 悬停配置

悬停配置选项通过`options.hover`命名空间进行传递。悬停配置的全局选项在`Chart.defaults.global.hover`中定义：

| 选项名 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| mode | String | 'nearest' | 元素出现在提示项中，更多配置见下一段`Interaction Modes` |
| intersect | Boolean | true | 设置为`true`时 只有鼠标与元素交叉时才出发悬停事件 |
| animationDuration | Number | 400 | 悬停变化延续时间 毫秒 |
| onHover | Function | null | 当触发悬停事件时执行的回调 |

<span id="jiao-hu-mo-shi"></span>
#### 交互模式

悬停配置和提示项配置中可以设置交互模式，以下几种模式可以配合`intersect`选项生效：

| 模式 | 表现形式 |
| --- | -------|
| point | 查找交互点的所有目标 |
| nearest | 查找交互点的最近目标 |
| single (deprecated) | 同 `nearest` |
| label (deprecated) | 见 `index` 模式 |
| index | 查找相同序列的目标 |
| x-axis (deprecated) | 同 `index` 同时 `intersect = false` |
| dataset | 查找同一数据组中的目标 |
| x | 只根据x坐标查找目标 |
| y | 只根据y坐标查找目标 |

<span id="dong-hua-pei-zhi"></span>
#### 动画配置

以下动画选项可供配置，动画配置的全局选项在`Chart.defaults.global.animation`中定义：

| 选项名 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| duration | Number | 1000 | 动画时间 毫秒 |
| easing | String | "easeOutQuart" | 滑出形式 可用的形式有`linear`, `easeInQuad`, `easeOutQuad`, `easeInOutQuad`, `easeInCubic`, `easeOutCubic`, `easeInOutCubic`, `easeInQuart`, `easeOutQuart`, `easeInOutQuart`, `easeInQuint`, `easeOutQuint`, `easeInOutQuint`, `easeInSine`, `easeOutSine`, `easeInOutSine`, `easeInExpo`, `easeOutExpo`, `easeInOutExpo`, `easeInCirc`, `easeOutCirc`, `easeInOutCirc`, `easeInElastic`, `easeOutElastic`, `easeInOutElastic`, `easeInBack`, `easeOutBack`, `easeInOutBack`, `easeInBounce`, `easeOutBounce`, `easeInOutBounce` |
| onProgress | Function | none | 动画持续时执行的回调 |
| onComplete | Function | none | 动画结束后的回调 |

##### 动画回调

动画配置中的 `onProgress `和`onComplete `回调动作可以同步外部图表的绘制，回调通过传对象实现以下接口，关于动画回调的例子见[Github](https://github.com/chartjs/Chart.js/blob/master/samples/animation/progress-bar.html)

```javascript
{
    // 图表对象
    chartInstance,

    // 执行中动画的详细信息
    animationObject,
}
```

##### 动画对象

传给动画回调的对象属于`Chart.Animation`类型，对象包含以下属性：

```javascript
{
    // Current Animation frame number
    currentStep: Number,

    // Number of animation frames
    numSteps: Number,

    // Animation easing to use
    easing: String,

    // Function that renders the chart
    render: Function,

    // User callback
    onAnimationProgress: Function,

    // User callback
    onAnimationComplete: Function
}
```

<span id="yuan-su-pei-zhi"></span>
#### 元素配置

元素配置的全局选项在`Chart.defaults.global.elements`中进行配置。

选项可以设置四种不同的元素：`arc`, `line`, `point`, `rectangle`，一旦对元素进行配置将会在全局生效，除非另写更明确的配置进行覆盖。

##### 弧形配置

| 选项名 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| backgroundColor | Color | 'rgba(0,0,0,0.1)' | 弧形的默认填充颜色 |
| borderColor | Color | '#fff' | 弧形边框默认颜色 |
| borderWidth | Number | 2 | 弧形边框默认宽度 |

##### 曲线配置

曲线元素设置图表中的曲线样式，全局选项保存在 `Chart.defaults.global.elements.line`

| 选项名 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| tension | Number | 0.4 | 默认贝塞尔曲线张力，设置0时相当于没有贝塞尔张力 |
| backgroundColor | Color | 'rgba(0,0,0,0.1)' | 曲线默认填充色 |
| borderWidth | Number | 3 | 曲线默认边框宽度 |
| borderColor | Color | 'rgba(0,0,0,0.1)' | 曲线默认边框颜色 |
| borderCapStyle | String | 	'butt' | 详情查看[MDN](https://developer.mozilla.org/en/docs/Web/API/CanvasRenderingContext2D/lineCap) |
| borderDash | Array | [] | 详情查看[MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash) |
| borderDashOffset | Number | 	0.0 | 详情查看[MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineDashOffset) |
| borderJoinStyle | String | 'miter' | 详情查看[MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineJoin) |
| capBezierPoints | Boolean | true | 设置为`true`时，贝塞尔曲线折点位于图表内，否则无限制 |
| fill | Boolean or String | true | 设置为`true`时，默认设置填充点为`zero`，也可以设置成`top`, `bottom`，设置为`false`时不填充 |
| stepped | Boolean | false | 设置为`true`时图表将显示折线图，没有贝塞尔弧度 |

<span id="yan-se"></span>
#### 颜色

你可以使用一系列格式去设置颜色选项。可以使用hexadecimal, RGB 或者 HSL notations，如果没有使用正确的格式，图表将默认使用全局颜色选项。全局颜色选项设置在`Chart.defaults.global.defaultColor`, 默认值为`rgba(0, 0, 0, 0.1)`。

同样，你也可以传一个[CanvasGradient](https://developer.mozilla.org/en-US/docs/Web/API/CanvasPattern)对象，使用传递对象可以实现更多的效果。

<span id="tu-an"></span>
#### 图案

选项会给图表传一个[CanvasPattern](https://developer.mozilla.org/en-US/docs/Web/API/CanvasPattern)对象，例如你想用一张图片填充数据，可以按以下方法实现：

```javascript
var img = new Image();
img.src = 'https://example.com/my_image.png';
img.onload = function() {
    var ctx = document.getElementById('canvas').getContext('2d');
    var fillPattern = ctx.createPattern(img, 'repeat');

    var chart = new Chart(ctx, {
        data: {
            labels: ['Item 1', 'Item 2', 'Item 3'],
            datasets: [{
                data: [10, 20, 30],
                backgroundColor: fillPattern
            }]
        }
    })
}
```

使用图案填充可以帮助有视力障碍的人更方便的查看你的图表。

使用[Patternnomaly](https://github.com/ashiguruma/patternomaly)库可以生成数据填充图。

```javascript
var chartData = {
    datasets: [{
        data: [45, 25, 20, 10],
        backgroundColor: [
            pattern.draw('square', '#ff6384'),
            pattern.draw('circle', '#36a2eb'),
            pattern.draw('diamond', '#cc65fe'),
            pattern.draw('triangle', '#ffce56'),
        ]
    }],
    labels: ['Red', 'Blue', 'Purple', 'Yellow']
};
```

<span id="hun-he-lei-xing"></span>
#### 混合图表类型

单独声明数据的类型时，可以生成混合图表，如下：

```javascript
var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Item 1', 'Item 2', 'Item 3'],
        datasets: [
            {
                type: 'bar',
                label: 'Bar Component',
                data: [10, 20, 30],
            },
            {
                type: 'line',
                label: 'Line Component',
                data: [30, 20, 10],
            }
        ]
    }
});
```


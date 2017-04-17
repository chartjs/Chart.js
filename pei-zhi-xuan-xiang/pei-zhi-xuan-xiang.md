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

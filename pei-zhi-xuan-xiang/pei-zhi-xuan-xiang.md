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


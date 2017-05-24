### 极地图
<span id="Introduction"></span>
#### 介绍
极地图类似于饼图，和饼图不同的是极地图的每一个部分的角度是相同的，只是在半径的值上有所不同

这种图表在展示类似于饼图那样的数据时很有用，但也会展示数据的不同级别。

![MacDown logo](./jiditu.png)

<span id="example"></span>
#### 实例

```javascript
new Chart(ctx, {
    data: data,
    type: 'polarArea',
    options: options
});
```
<span id="dataset"></span>
#### 数据集结构
下面的一些选项配置可以使用到极地图中以实现具体的数据展示要求。

一些参数可以成为一个具体的数组。第一个元素值适用于的第一个部分，第二个元素值适用于第二个部分，以此类推。

Property            | Type	             | Usage                |
--------------------|------------------|-----------------------|
data                | Array<Number>    | 绘制弧形的数据
label               | String           | 出现在图例和提示工具中的数据集的标签
backgroundColor     | Array<Color>     | 弧形的填充色. See [Colors](http://www.chartjs.org/docs/#chart-configuration-colors)
borderColor         | Array<Color>     | 弧形边框颜色
borderWidth         | Array<Number>	   | 弧形边框宽度（像素级）
hoverBackgroundColor| Array<Color>     | 悬停时的弧形填充色
hoverBorderColor    | Array<Color>     | 悬停时的弧形边框颜色
hoverBorderWidth    | Array<Number>    | 悬停时的弧形边框宽度

下面是一个使用上述属性的实例：

```javascript
var data = {
    datasets: [{
        data: [
            11,
            16,
            7,
            3,
            14
        ],
        backgroundColor: [
            "#FF6384",
            "#4BC0C0",
            "#FFCE56",
            "#E7E9ED",
            "#36A2EB"
        ],
        label: 'My dataset' // for legend
    }],
    labels: [
        "Red",
        "Green",
        "Yellow",
        "Grey",
        "Blue"
    ]
};
```

如你所见，你在图表中传递了一个对象数组，包含了数值和颜色。value属性应该是数值类型，color属性应该是字符串类型，代表颜色的字符串，你可以使用HEX标记，RGB，RGBA，或事HSL。

<span id="option"></span>
#### 图表选项
这里介绍的是一些定制化极地图的具体选项。这些选项都已经合并到了[图表全局配置选项](http://www.chartjs.org/docs/#global-chart-configuration)了，包含了图表的选项。

Name                         | Type	    | Default                |  Description
-----------------------------|----------|------------------------|-----------------------|
startAngle                   | Number   | -0.5 * Math.PI         | 为数据集中的第一个类型设定角度
scale                        | Object   | [See Scales](http://www.chartjs.org/docs/#scales) and [Defaults for Radial Linear Scale](http://www.chartjs.org/docs/#scales-radial-linear-scale) | 图表中的设置缩略的选项.适用于ticks, labels, 和grid lines.
scale.type                   | String   | "radialLinear"         | 在"Radial Linear"中定义
scale.lineArc                | Boolean  | true                   | 值为true时, 为圆形.
animation.animateRotate      | Boolean  | true                   | 值为true时, 图表将会带有动画效果旋转.
animation.animateScale       | Boolean  | true                   | 值为true时, 图表将会带有动画效果缩放
legend.labels.generateLabels | Function | function(data) {}      | 返回每一个说明的标签
legend.onClick               | Function | function(event, legendItem) {} |	处理说明的点击事件
legendCallback               | Function | function(chart)        | 通过调用generateLegend生成html的说明

你可以依据你自己的图表情况适时的传递第二个对象参数来覆盖修改你需要修改的选项。

例如，下面设置了极地图的每一块的弧度颜色值都为黑色：

```javascript
new Chart(ctx, {
    data: data,
    type: "polarArea",
    options: {
        elements: {
            arc: {
                borderColor: "#000000"
            }
        }
    }
});
// This will create a chart with all of the default options, merged from the global config,
// and the PolarArea chart defaults but this particular instance will have `elements.arc.borderColor` set to `"#000000"`.
```

我们也可以修改每一个极地图在创建时的默认值，这些值都存在于**Chart.default.polarArea**.
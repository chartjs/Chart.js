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
data | Array<Number> |	The data to plot as arcs
label | String |	The label for the dataset which appears in the legend and tooltips
backgroundColor | Array<Color> | The fill color of the arcs. See Colors
borderColor | Array<Color> |Arc border color
borderWidth | Array<Number>	 | Border width of arcs in pixels
hoverBackgroundColor | Array<Color> | Arc background color when hovered
hoverBorderColor | Array<Color> | Arc border color when hovered
hoverBorderWidth |	Array<Number> | Border width of arc when hovered

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

Name            | Type	             | Default                |  Description
--------------------|------------------|-----------------------|-----------------------|
startAngle | Number | -0.5 * Math.PI | Sets the starting angle for the first item in a dataset
scale | Object |	See Scales and Defaults for Radial Linear Scale | Options for the one scale used on the chart. Use this to style the ticks, labels, and grid.
scale.type | String | "radialLinear" | As defined in "Radial Linear".
scale.lineArc |	Boolean | true |	When true, lines are circular.
animation.animateRotate |	Boolean|	true |	If true, will animate the rotation of the chart.
animation.animateScale | Boolean | true | If true, will animate scaling the chart.
legend.labels.generateLabels | Function | function(data) {} | Returns labels for each the legend
legend.onClick |	Function | function(event, legendItem) {} |	Handles clicking an individual legend item
legendCallback | Function | function(chart) | 	Generates the HTML legend via calls to generateLegend

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
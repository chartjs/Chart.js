### 雷达图
<span id="Introduction"></span>
#### 介绍
雷达图展示的是许多种数据以及他们之间的差异。

这一类图通常用来对两组或多组数据进行差异化比较。

![MacDown logo](./leidatu.png)

<span id="example"></span>
#### 实例

```javascript
var myRadarChart = new Chart(ctx, {
    type: 'radar',
    data: data,
    options: options
});
```


<span id="dataset"></span>
#### 数据集结构
下面的一些选项配置可以使用到雷达图中以实现具体的数据展示要求。

所有以point开头的参数都可以成为一个具体的数组。如果存在这样的数组，那第一个元素值适用于雷达图中的第一个点，第二个元素值适用于雷达图中的第二个点，以此类推。

Property            | Type	             | Usage                |
--------------------|------------------|-----------------------|
data                |	Array<Number>	   | The data to plot in a line
label	              | String	 |The label for the dataset which appears in the legend and tooltips
fill                |  Boolean	      |If true, fill the area under the line
lineTension | 	Number |	Bezier curve tension of the line. Set to 0 to draw straightlines. Note This was renamed from 'tension' but the old name still works.
backgroundColor |	Color	| The fill color under the line. See Colors
borderWidth|	Number	|The width of the line in pixels
borderColor|	Color	|The color of the line.
borderCapStyle|	String|	Cap style of the line. See MDN
borderDash|	Array<Number> |	Length and spacing of dashes. See MDN
borderDashOffset |	Number	 |Offset for line dashes. See MDN
borderJoinStyle|	String |	Line joint style. See MDN
pointBorderColor|	Color or Array<Color>|	The border color for points.
pointBackgroundColor|	Color or Array<Color>|	The fill color for points
pointBorderWidth |	Number or Array<Number>|	The width of the point border in pixels
pointRadius|	Number or Array<Number>	| The radius of the point shape. If set to 0, nothing is rendered.
pointHoverRadius|	 Number or Array<Number>|	The radius of the point when hovered
pointHitRadius|	Number or Array<Number>	| The pixel size of the non-displayed point that reacts to mouse events
pointHoverBackgroundColor|	Color or Array<Color>|	Point background color when hovered
pointHoverBorderColor|	Color or Array<Color>|	Point border color when hovered
pointHoverBorderWidth|	Number or Array<Number>|	Border width of point when hovered
pointStyle|	String or Array<String>	| The style of point. Options include 'circle', 'triangle', 'rect', 'rectRounded', 'rectRot', 'cross', 'crossRot', 'star', 'line', and 'dash'

下面是一个使用上述属性的实例：

```javascript
var data = {
    labels: ["Eating", "Drinking", "Sleeping", "Designing", "Coding", "Cycling", "Running"],
    datasets: [
        {
            label: "My First dataset",
            backgroundColor: "rgba(179,181,198,0.2)",
            borderColor: "rgba(179,181,198,1)",
            pointBackgroundColor: "rgba(179,181,198,1)",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "rgba(179,181,198,1)",
            data: [65, 59, 90, 81, 56, 55, 40]
        },
        {
            label: "My Second dataset",
            backgroundColor: "rgba(255,99,132,0.2)",
            borderColor: "rgba(255,99,132,1)",
            pointBackgroundColor: "rgba(255,99,132,1)",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "rgba(255,99,132,1)",
            data: [28, 48, 40, 19, 96, 27, 100]
        }
    ]
};
```

对于雷达图来说，为了提供每一个点的说明信息，我们在图表中使用数组的形式配置这些说明信息。对于雷达图数据来说，我们提供了一个数据集，每一组数据都是一个对象，里面是每一个点的样式配置信息。除此之外，还有以数组形式进行配置的data数据。数据集中的标签都是可选的，而且能在图表成规模的时候使用。


<span id="option"></span>
#### 图表选项
这里介绍的是一些定制化雷达图的具体选项。这些选项都已经合并到了[图表全局配置选项](http://www.chartjs.org/docs/#global-chart-configuration)了，包含了图表的选项。

柱状图的默认选项被设置在**Chart.defaults.radar**中。

Name            | Type	             | Default                |  Description
--------------------|------------------|-----------------------|-----------------------|
scale |	Object|	See Scales and Defaults for Radial Linear Scale|	Options for the one scale used on the chart. Use this to style the ticks, labels, and grid lines.
scale.type |	String |	"radialLinear" |	As defined in "Radial Linear".
elements.line	 | Object |	|	Options for all line elements used on the chart, as defined in the global elements, duplicated here to show Radar chart specific defaults.
elements.line.lineTension |	Number |	0| Tension exhibited by lines when calculating splineCurve. Setting to 0 creates straight lines.
startAngle |	Number |	0	| The number of degrees to rotate the chart clockwise.

你可以依据你自己的图表情况适时的传递第二个对象参数来覆盖修改你需要修改的选项。

例如，我的雷达图有一块缺少数据，在此基础上可以像下面这样做：

```javascript
new Chart(ctx, {
    type: "radar",
    data: data,
    options: {
            scale: {
                reverse: true,
                ticks: {
                    beginAtZero: true
                }
            }
    }
});
// This will create a chart with all of the default options, merged from the global config,
//  and the Radar chart defaults but this particular instance's scale will be reversed as
// well as the ticks beginning at zero.
```

我们也可以修改每一个雷达图在创建时的默认值，这些值都存在于**Chart.default.radar**.
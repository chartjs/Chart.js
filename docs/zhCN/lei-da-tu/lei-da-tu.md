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

Property                 | Type	                     | Usage                          |
-------------------------|---------------------------|--------------------------------|
data                     | Array<Number>	         | 绘制图线的数据
label	                 | String	                 | 出现在图例和提示工具中的数据集的标签
fill                     | Boolean	                 | 如果为true, 填充线下的部分
lineTension              | Number                    | 贝赛尔曲线张力设置. 值为0时为直线. 这个属性是从之前版本的‘tension’重命名过来的，‘tension’照常使用
backgroundColor          | Color	                 | 线下的填充色. See [Colors](http://www.chartjs.org/docs/#chart-configuration-colors)
borderWidth              | Number	                 | 线的宽度（像素级）
borderColor              | Color	                 | 线的颜色
borderCapStyle           | String                    | 线尾部的样式. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineCap)
borderDash               | Array<Number>             | 虚线的长度和空间设置. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash)
borderDashOffset         | Number	                 | 虚线间隔. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineDashOffset)
borderJoinStyle          | String                    | 连接线的颜色. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineJoin)
pointBorderColor         | Color or Array<Color>     | 点的边框颜色
pointBackgroundColor     | Color or Array<Color>     | 点的填充颜色
pointBorderWidth         | Number or Array<Number>   | 点的边框宽度（像素级）
pointRadius              | Number or Array<Number>   | 点的形状半径. 如果设为0，即不会渲染.
pointHoverRadius         | Number or Array<Number>   | 悬停时点的半径
pointHitRadius           | Number or Array<Number>   | 鼠标事件发生时对于之前不显示的点的半径
pointHoverBackgroundColor| Color or Array<Color>     | 悬停时点的背景颜色
pointHoverBorderColor    | Color or Array<Color>     | 悬停时点的边框颜色
pointHoverBorderWidth    | Number or Array<Number>   | 悬停时点的边框宽度
pointStyle               | String or Array<String>	 | 点的样式. 选项包括 'circle', 'triangle', 'rect', 'rectRounded', 'rectRot', 'cross', 'crossRot', 'star', 'line', and 'dash'

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

Name                      | Type	  | Default               |  Description
--------------------------|-----------|-----------------------|-----------------------|
scale                     |	Object    |	[See Scales](http://www.chartjs.org/docs/#scales) and [Defaults for Radial Linear Scale](http://www.chartjs.org/docs/#scales-radial-linear-scale)|	图表中的设置缩略的选项.适用于ticks, labels, 和grid lines.
scale.type                |	String    |	"radialLinear"        |	在"Radial Linear"中定义
elements.line	          | Object    |	                      |	适用于图表中所有线性选项, 作为全局元素被定义, 在这里复述是为了说明雷达图特殊的默认值.
elements.line.lineTension |	Number    |	0                     | 计算线的锯齿程度时设置的张力表现值. 值为0时为一条直线.
startAngle                |	Number    |	0	                  | 顺时针方向旋转图表的角度

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
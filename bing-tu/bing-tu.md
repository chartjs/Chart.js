### 饼图&环形图
<span id="Introduction"></span>
#### 介绍
饼图和环形图可能是使用最广泛的图表了。他们按扇形块展示数据，扇形的弧度大小即可提现数值比例。

他们在体现数值差异上非常有用。

饼图和环形图在chart.js中属于同一个类别但是他们有一个默认的参数值是不同的－这个参数就是**cutouPercentage**.
这个参数设置了去除以圆心为中心的一定比例的部分。饼图的默认值是0％，环形图的默认值是50%。

他们在图表中被注册为两个类别。但除了他们不同的默认值和类别，其余的部分都是一样的。

![MacDown logo](./bingtu.png)

<span id="example"></span>
#### 实例

```javascript
// 饼图
var myPieChart = new Chart(ctx,{
    type: 'pie',
    data: data,
    options: options
});
```

```javascript
// 圆环图
var myDoughnutChart = new Chart(ctx, {
    type: 'doughnut',
    data: data,
    options: options
});
```


<span id="dataset"></span>
#### 数据集结构
Property            | Type	             | Usage                |
--------------------|------------------|-----------------------|
data|	Array<Number>|	The data to plot as arcs
label|	String|	The label for the dataset which appears in the legend and tooltips
backgroundColor|	Array<Color>|	The fill color of the arcs. See Colors
borderColor|	Array<Color>|	Arc border color
borderWidth|	Array<Number>|	Border width of arcs in pixels
hoverBackgroundColor|	Array<Color>|	Arc background color when hovered
hoverBorderColor|	Array<Color>|	Arc border color when hovered
hoverBorderWidth|	Array<Number>|	Border width of arc when hovered

下面是一个使用上述属性的实例：

```javascript
var data = {
    labels: [
        "Red",
        "Blue",
        "Yellow"
    ],
    datasets: [
        {
            data: [300, 50, 100],
            backgroundColor: [
                "#FF6384",
                "#36A2EB",
                "#FFCE56"
            ],
            hoverBackgroundColor: [
                "#FF6384",
                "#36A2EB",
                "#FFCE56"
            ]
        }]
};

```
对于饼图来说，数据集需要包含一个由一些数据点组成的数组。这些数据点的类型应该是数值型，Chart.js会统计这些数据点，然后计算出每个数据点所占据的比例。你也可以添加一组由一些颜色值组成的数组。这些颜色值应该是字符串型。和css中的颜色值相似，你可以用HEX标记，RGB，RGBA，或是HSL来描述你的颜色值。

<span id="option"></span>
#### 图表选项
这里介绍的是一些定制化饼图和圆环图的具体选项。这些选项都已经合并到了[图表全局配置选项](http://www.chartjs.org/docs/#global-chart-configuration)了，包含了图表的选项。

Name            | Type	             | Default                |  Description
--------------------|------------------|-----------------------|-----------------------|
cutoutPercentage|	Number|	50 - for doughnut, 0 - for pie|The percentage of the chart that is cut out of the middle.
rotation|Number|-0.5 * Math.PI|Starting angle to draw arcs from
circumference|	Number|	2 * Math.PI|	Sweep to allow arcs to cover
animation.animateRotate	|Boolean|	true| If true, will animate the rotation of the chart.
animation.animateScale|Boolean|	false| If true, will animate scaling the Doughnut from the centre.
legend.labels.generateLabels| Function| function(chart) {}| Returns a label for each item to be displayed on the legend.
legend.onClick| Function| function(event, legendItem) {} | Handles clicking an individual legend item

你可以依据你自己的图表情况适时的传递第二个对象参数来覆盖修改你需要修改的选项。

例如，环形图中从中心向外扩散的配置如下：

```javascript
new Chart(ctx,{
    type:"doughnut",
    options: {
        animation:{
            animateScale:true
        }
    }
});
// This will create a chart with all of the default options, merged from the global config,
// and the Doughnut chart defaults but this particular instance will have `animateScale` set to `true`.
```

我们也可以修改每一个极地图在创建时的默认值，这些值都存在于**Chart.default.doughnut**.饼图的默认配置除了**cutoutPercentage**参数默认为0之外其他配置和环形图一样。


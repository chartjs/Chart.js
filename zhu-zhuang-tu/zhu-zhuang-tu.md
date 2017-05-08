### 柱状图
<span id="Introduction"></span>
#### 介绍
柱状图是用柱来展现数据大小与区别的一种方式。

有时会用来展示数据趋势，或用来进行不同数据的对比。

![MacDown logo](./zhuzhuangtu.png)

<span id="example"></span>
#### 实例

```javascript
var myBarChart = new Chart(ctx, {
    type: 'bar',
    data: data,
    options: options
});
```

或是来一个水平的。

```javascript
var myBarChart = new Chart(ctx, {
    type: 'horizontalBar',
    data: data,
    options: options
});
```

<span id="dataset"></span>
#### 数据集结构
下面的一些选项配置可以使用到柱状图中以实现具体的数据展示要求。

其中有一些参数可以是一个具体的数组。如果存在这样的数组，那第一个元素值适用于柱图中的第一类，第二个元素值适用于柱图中的第二类，以此类推。

Property            | Type	             | Usage                |
--------------------|------------------|-----------------------|
data                |Array<number>     |制作柱状图的数据
label               |String          | 出现在图例和提示工具中的数据集的标签
xAxisID             |String          |	x轴的数据集id
yAxisID             |String	          | y轴的数据集id
backgroundColor     |Color or Array\<Color>|柱状体的[颜色](http://www.chartjs.org/docs/#chart-configuration-colors)
borderColor         |Color or Array\<Color>| 柱状体边框颜色
borderWidth         |Number or Array\<Number>|	柱状体边框宽度（像素）
borderSkipped       |String or Array\<String>|	标记不需要边框的方位. 选项为：上，下，左，右
hoverBackgroundColor|Color or Array\<Color>|	悬停时的柱状体颜色
hoverBorderColor    |Color or Array\<Color>|	悬停时的柱状体边框颜色
hoverBorderWidth    |Number or Array\<Number>|	悬停时的柱状体边框宽度
stack               |String                 |	数据集集合的Id（当这些集合被重叠在一起，每一个集合都是一个单个的栈）


下面是一个使用上述属性的实例：

```javascript
var data = {
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [
        {
            label: "My First dataset",
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255,99,132,1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1,
            data: [65, 59, 80, 81, 56, 55, 40],
        }
    ]
};
```

柱状图的数据结构和线图的数据结构很相似，都有一组数据集，带着颜色和数据的配置。我们也有一组为了展示用的标签。在上述实例中，我们使用的是和线图中的实例相同的数据。

<span id="option"></span>
#### 图表选项
这里介绍的是一些定制化柱状图的具体选项。这些选项都已经合并到了[图表全局配置选项](http://www.chartjs.org/docs/#global-chart-configuration)了，包含了图表的选项。

柱状图的默认选项被设置在**Chart.defaults.bar**中。

Name                | Type    | Default          | Description|
--------------------|---------|------------------|--------------------
hover.mode	        |String	  |"label"           |标签的悬浮模式. "label"在x轴按索引展示数据时被用到.
scales	            |Object	  |-	             |-
scales.xAxes	    |Array	  |                  |柱状图官方只支持一条x轴，通过数组保持API的持久性。如果你有多条轴的使用需求，请使用散射图。 
Options for xAxes   |         |                  |
type	            |String	  |"Category"        |在缩放时定义.
display	            |Boolean  |true              |如果是true，显示缩放比例.
id	                |String	  |"x-axis-0"	     |坐标轴的id，便于数据绑定
stacked	            |Boolean  |false	         |如果是true，x轴的柱图会存在间隔
barThickness	    |Number   |                  |像素级手动设置每一个柱图的宽度，如果没有设置，每个柱图宽度会自适应.
categoryPercentage  |Number   |0.8               |用于设置条形图中长条的每个数据点的可用宽度的百分比（0-1）（小数据集的网格线之间的间距. 　[更多](http://www.chartjs.org/docs/#bar-chart-barpercentage-vs-categorypercentage)
barPercentage	    |Number	  |0.9	             |每个栏的可用宽度的百分比（0-1）应在类别百分比内。 1.0将占据整个类别的宽度，并将条形图放在彼此旁边. [更多](http://www.chartjs.org/docs/#bar-chart-barpercentage-vs-categorypercentage)
gridLines	        |Object	  |[See Scales](http://www.chartjs.org/docs/#scales)	     |
gridLines.offsetGridLines |Boolean |true         |如果为true, 特定的柱状图数据点的条形线落在网格线之间。 如果为false, 网格线将沿着条形图的中间。
scales.yAxes	    |Array	  |[{type:"linear"}] |	
Options for yAxes   |         |                  |			
type	            |String	  |"linear"	         |在[缩放](http://www.chartjs.org/docs/#scales-linear-scale)时定义.
display	            |Boolean  |true	             |如果是true，显示缩放比例.
id	                |String   |"y-axis-0"        |坐标轴的id，便于数据绑定.
stacked	            |Boolean  |false             |如果是true，y轴的柱图会存在间隔
barThickness	    |Number	  |	                 |像素级手动设置每一个柱图的宽度，如果没有设置，每个柱图宽度会自适应.

你可以依据你自己的图表情况适时的传递第二个对象参数来覆盖修改你需要修改的选项。
例如，我们有一个stacked选项为false的柱状图，我们在此基础上可以像下面这样做：

```javascript
new Chart(ctx, {
    type: "bar",
    data: data,
    options: {
        scales: {
            xAxes: [{
                stacked: true
            }],
            yAxes: [{
                stacked: true
            }]
        }
    }
});
// This will create a chart with all of the default options, merged from the global config,
//  and the Bar chart defaults but this particular instance will have `stacked` set to true
// for both x and y axes.
```

我们也可以修改每一个柱在创建时的默认值，这些值都存在于**Chart.default.bar**.对于水平柱状图来说，这些默认值存在于**Chart.defaults.horizontalBar**.

水平柱状图的x轴与y轴是交换的，初次之外还有一些额外的选项。

Name           | Type	             | Default                | Description
--------------------|------------------|-----------------------|--------------------
Options for xAxes	| | |
position | String | "bottom"|
Option for yAxes    | | |
position | String | "left"|

<span id="vs"></span>
#### 柱状百分比 vs 种类百分比
下面展示了柱状百分比选项与种类百分比选项之间的关系。

```javascript
// categoryPercentage: 1.0
// barPercentage: 1.0
Bar:        | 1.0 | 1.0 |
Category:   |    1.0    |   
Sample:     |===========|

// categoryPercentage: 1.0
// barPercentage: 0.5
Bar:          |.5|  |.5|
Category:  |      1.0     |   
Sample:    |==============|

// categoryPercentage: 0.5
// barPercentage: 1.0
Bar:            |1.||1.|
Category:       |  .5  |   
Sample:     |==============|
```

### 曲线图

<span id="introduction"></span>
#### 介绍

曲线图可以让数据使用折线的方式呈现。经常用于表现趋势，以及展示两类数据的对比效果。

![](/assets/line-chart@2x.png)

<span id="example-usage"></span>
#### 代码示例
```javascript
var myLineChart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: options
});
```

另外也可以使用v1.0版本的语法创建一曲线图
```javascript
var myLineChart = Chart.Line(ctx, {
    data: data,
    options: options
});
```

<span id="dataset-structure"></span>
#### 数据结构

下面的一些选项配置可以使用到曲线图中以实现具体的数据展示要求。

所有带*的属性值可以指定为一个数组。如果它的值被设置成数组，那数组的第一项被应用为第一个点，数组第二项应用为第二个点，以此类推。

| Property	                    | Type	                    | Usage                     |
|:------------------------------|:--------------------------|:--------------------------|
|data	                        |See data point section	    |The data to plot in a line |
|label	                        |String	                    |The label for the dataset which appears in the legend and tooltips|
|xAxisID	                    |String	                    |The ID of the x axis to plot this dataset on|
|yAxisID	                    |String	                    |The ID of the y axis to plot this dataset on|
|fill	                        |Boolean	                |If true, fill the area under the line|
|cubicInterpolationMode	        |String	                    |Algorithm used to interpolate a smooth curve from the discrete data points. Options are 'default' and 'monotone'. The 'default' algorithm uses a custom weighted cubic interpolation, which produces pleasant curves for all types of datasets. The 'monotone' algorithm is more suited to y = f(x) datasets : it preserves monotonicity (or piecewise monotonicity) of the dataset being interpolated, and ensures local extremums (if any) stay at input data points. If left untouched (undefined), the global options.elements.line.cubicInterpolationMode property is used.|
|lineTension	                |Number	                    |Bezier curve tension of the line. Set to 0 to draw straightlines. This option is ignored if monotone cubic interpolation is used. Note This was renamed from 'tension' but the old name still works.|
|backgroundColor	            |Color	                    |The fill color under the line. See Colors|
|borderWidth	                |Number	                    |The width of the line in pixels|
|borderColor	                |Color	                    |The color of the line.|
|borderCapStyle	                |String	                    |Cap style of the line. See MDN|
|borderDash	                    |Array<Number>	            |Length and spacing of dashes. See MDN|
|borderDashOffset	            |Number	                    |Offset for line dashes. See MDN|
|borderJoinStyle	            |String	                    |Line joint style. See MDN|
|pointBorderColor	            |Color or Array<Color>	    |The border color for points.|
|pointBackgroundColor	        |Color or Array<Color>	    |The fill color for points|
|pointBorderWidth	            |Number or Array<Number>	|The width of the point border in pixels|
|pointRadius	                |Number or Array<Number>	|The radius of the point shape. If set to 0, nothing is rendered.|
|pointHoverRadius	            |Number or Array<Number>	|The radius of the point when hovered|
|pointHitRadius	                |Number or Array<Number>	|The pixel size of the non-displayed point that reacts to mouse events|
|pointHoverBackgroundColor	    |Color or Array<Color>	    |Point background color when hovered|
|pointHoverBorderColor	        |Color or Array<Color>	    |Point border color when hovered|
|pointHoverBorderWidth	        |Number or Array<Number>	|Border width of point when hovered|
|pointStyle	String,             |Array<String>, Image, Array<Image>	|The style of point. Options are 'circle', 'triangle', 'rect', 'rectRounded', 'rectRot', 'cross', 'crossRot', 'star', 'line', and 'dash'. If the option is an image, that image is drawn on the canvas using drawImage.|
|showLine	                    |Boolean	                |If false, the line is not drawn for this dataset|
|spanGaps	                    |Boolean	                |If true, lines will be drawn between points with no or null data|
|steppedLine	                |Boolean	                |If true, the line is shown as a stepped line and 'lineTension' will be ignored|

使用这些属性的示例数据对象如下所示。
```javascript
var data = {
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [
        {
            label: "My First dataset",
            fill: false,
            lineTension: 0.1,
            backgroundColor: "rgba(75,192,192,0.4)",
            borderColor: "rgba(75,192,192,1)",
            borderCapStyle: 'butt',
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: 'miter',
            pointBorderColor: "rgba(75,192,192,1)",
            pointBackgroundColor: "#fff",
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: "rgba(75,192,192,1)",
            pointHoverBorderColor: "rgba(220,220,220,1)",
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            data: [65, 59, 80, 81, 56, 55, 40],
            spanGaps: false,
        }
    ]
};
```

曲条图通常需要一个label标签数组。这些标签将会被显示在x轴上. 每个数据点必须有一个label标签。label标签比数据更多的是允许的，在这种情况下，曲线将以最后一个数据点结尾.曲线图的数据被分解成一系列数据集。每个数据集有一个填充的颜色，线条的颜色和点的颜色以及分散的点.这些颜色就像CSS中那样的颜色字符串,你可以使用RGBA，RGB，HEX或HSL的符号。
每个数据集上的标签键是可选的，可以在生成图表的刻度时使用。
当spangaps设置为true时，在稀疏的数据点之间的缝隙将会被填满。默认情况下，它是关闭的。

<span id="data-points"></span>
#### 数据点

传递给图表的数据可以以两种格式传递.最常用的方法是将数据数组作为数字数组传递.在这种情况下，必须指定的data.labels数组必须为每个点包含一个label标签，标签在这种情况下就可以显示多行标签数组（每一行）比如[["June","2015"], "July"].
间隔被用于稀疏数据集.数据指定使用包含X和Y属性的对象.稀疏数据集的使用后面会有记录展示.

<span id="scatter-line-charts"></span>
#### 散射线图

散射线图可以通过改变x轴的type值为linear来创建.要使用散射线图,传入的数据格式必须是包含X和Y属性的对象.下面的例子是使用3个点创建一个散射线图.

```javascript
 var scatterChart = new Chart(ctx, {
     type: 'line',
     data: {
         datasets: [{
             label: 'Scatter Dataset',
             data: [{
                 x: -10,
                 y: 0
             }, {
                 x: 0,
                 y: 10
             }, {
                 x: 10,
                 y: 5
             }]
         }]
     },
     options: {
         scales: {
             xAxes: [{
                 type: 'linear',
                 position: 'bottom'
             }]
         }
     }
 });
```

<span id="chart-options"></span>
#### 图标选项

这些都是曲线图具体的定制选项。这些选项与全局图表配置选项合并，并形成图表的选项。
| Name          | Type            | Default       | Description    |
|:------------- |:---------------:| -------------:|----------------|
|showLines	    |Boolean	      |true	          |If false, the lines between points are not drawn |
|spanGaps	    |Boolean	      |false	      |If true, NaN data does not break the line |

You can override these for your Chart instance by passing a member options into the Line method.

通过将这些成员选项传递到type为line的构造方法中，可以为图表实例重写这些选项。

例如，下面我们可以做一个没有X轴的曲线图展示。配置能足够智能的处理数组合并，因此您不需要指定所有轴设置来改变一件事。

```javascript
new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        scales: {
            xAxes: [{
                display: false
            }]
        }
    }
});
```

我们还可以为所有以type为line创建的图表统一修改这些默认值，该对象可以使用chart.defaults.line。

<span id="stacked-charts"></span>
#### 堆积图

堆叠区域图可以通过设置Y轴到堆叠配置来创建。下面是堆叠曲线图的示例。

```javascript
var stackedLine = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        scales: {
            yAxes: [{
                stacked: true
            }]
        }
    }
});
```

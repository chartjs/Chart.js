### 折线图

<span id="Introduction"></span>
#### 介绍

折线图可以让数据使用折线的方式呈现。经常用于表现趋势，以及展示两类数据的对比效果。

![](/assets/line-chart@2x.png)

<span id="ExampleUsage"></span>
#### 代码示例
```javascript
var myLineChart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: options
});
```

另外也可以使用v1.0版本的语法创建一折线图
```javascript
var myLineChart = Chart.Line(ctx, {
    data: data,
    options: options
});
```

<span id="DatasetStructure"></span>
#### 数据结构
下面的一些选项配置可以使用到折线图中以实现具体的数据展示要求。

所有带*的属性值可以指定为一个数组。如果它的值被设置成数组，那数组的第一项被应用为第一个点，数组第二项应用为第二个点，以此类推。

<span id="ChartOptions"></span>
#### 图标选项
这些都是折线图具体的定制选项。这些选项与全局图表配置选项合并，并形成图表的选项。
| Name          | Type            | Default       | Description    |
|:------------- |:---------------:| -------------:|----------------|
|showLines	    |Boolean	      |true	          |If false, the lines between points are not drawn |
|spanGaps	    |Boolean	      |false	      |If true, NaN data does not break the line |

You can override these for your Chart instance by passing a member options into the Line method.

通过将这些成员选项传递到type为line的构造方法中，可以为图表实例重写这些选项。

For example, we could have a line chart display without an X axis by doing the following. The config merge is smart enough to handle arrays so that you do not need to specify all axis settings to change one thing.

例如，下面我们可以做一个没有X轴的折线图展示。配置能足够智能的处理数组合并，因此您不需要指定所有轴设置来改变一件事。

```
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

We can also change these defaults values for each Line type that is created, this object is available at Chart.defaults.line.
我们还可以为所有以type为line创建的图表统一修改这些默认值，该对象可以使用chart.defaults.line。

<span id="StackedCharts"></span>
#### 堆积图
堆叠区域图可以通过设置Y轴到堆叠配置来创建。下面是堆叠折线图的示例。

```
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

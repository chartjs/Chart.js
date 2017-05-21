### 轴线选项
<span id="common"></span>
轴线类型在第二版的chartjs中有了显著的提升，而且和第一版的有所区别。

* 支持多个x轴与多个y轴的情况。
* 内置的标签有一个auto-skip特性，当检测到有ticks和lables要重叠时，它会去掉这第n个lable来保持正常的显示。
* 支持轴线标题。
* 可以在原有基础上扩展新的轴线类别而不用重新写一个。

#### 常见配置
每一个轴线都继承了核心的轴线类，这个轴线类有如下配置选项：

Name                       | Type	   | Default         |  Description
---------------------------|-----------|-----------------|-----------------------|
type	                   | String	   | Chart specific. | 轴线类型. 目前可以使用一个字符串关键字进行使用和注册。选项有: "category", "linear", "logarithmic", "time", "radialLinear"
display	                   | Boolean   | true	         | 如果为true, 会展示网格线, 记号, 和标签的轴线. 并会重写网格线，记号，和标签的display选项.
position	               | String	   | "left"	         | 轴线的位置. 可能的值为：'top', 'left', 'bottom' 和 'right'.
id	                       | String	   |                 | id将轴线的轴和数据集联系在一起. 属性datasets.xAxisID／yAxisID不得不匹配轴线的属性scales.xAxes／yAxes.id. 这在多轴的情况下是特别需要的。
beforeUpdate	           | Function  | undefined       | 更新程序运行前调用. 传递单个参数, scale实例.
beforeSetDimensions	       | Function  | undefined       | 大小设置前调用. 传递单个参数, scale实例.
afterSetDimensions	       | Function  | undefined       | 大小设置后调用. 传递单个参数, scale实例.
beforeDataLimits	       | Function  | undefined       | 数据限制确定前调用. 传递单个参数, scale实例.
afterDataLimits	           | Function  | undefined       | 数据限制确定后调用. 传递单个参数, scale实例.
beforeBuildTicks	       | Function  | undefined       | 记号创建前调用. 传递单个参数, scale实例.
afterBuildTicks	           | Function  | undefined       | 记号创建后调用. Useful for filtering ticks. 传递单个参数, scale实例.
beforeTickToLabelConversion| Function  | undefined       | 记号转变为字符串之前调用. 传递单个参数, scale实例.
afterTickToLabelConversion | Function  | undefined       | 记号转变为字符串之后调用. 传递单个参数, scale实例.
beforeCalculateTickRotation| Function  | undefined       | 记号旋转前调用.传递单个参数, scale实例.
afterCalculateTickRotation | Function  | undefined       | 记号旋转后调用. 传递单个参数, scale实例.
beforeFit	               | Function  | undefined       | 轴线缩放比例适用于canvas画布之前调用. 传递单个参数, scale实例.
afterFit	               | Function  | undefined       | 轴线缩放比例适用于canvas画布之后调用. 传递单个参数, scale实例.
afterUpdate	               | Function  | undefined       | 更新程序运行后调用. 传递单个参数, scale实例.
gridLines	               | Object	   | -               | 请看[网格线配置](http://www.chartjs.org/docs/#grid-line-configuration)部分.
scaleLabel	               | Object	   |                 | 请看[轴线标题配置](http://www.chartjs.org/docs/#scale-title-configuration)部分.
ticks	                   | Object	   |                 | 请看[记号配置](http://www.chartjs.org/docs/#tick-configuration)部分.

##### 网格线配置
网格线的配置是在轴线选项key为gridLines时启用。它定义了运行垂直于轴的网格线。

Name             | Type	                   | Default               |  Description
-----------------|-------------------------|-----------------------|-----------------------|
display	         | Boolean	               | true	               |
color	         | Color or Array[Color]   | "rgba(0, 0, 0, 0.1)"  | 网格线颜色.
borderDash	     | Array[Number]	       | []	                   | 虚线的长度和空格. 请看[MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash)
borderDashOffset | Number	               | 0.0	               | 虚线的偏移值. 请看[MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineDashOffset)
lineWidth        | Number or Array[Number] | 1	                   | 网格线粗细程度
drawBorder       | Boolean	               | true	               | 如果为true，在图表边缘画边框
drawOnChartArea  | Boolean	               | true	               | 如果为true，图表区域内轴上画线. 在多个轴的情况下而你想精确绘制网格线的时候很有用
drawTicks	     | Boolean	               | true	               | 如果为true, 图表旁边轴线内记号旁边画线
tickMarkLength	 | Number	               | 10                    | 轴线区域内网格线的长度（像素级）.
zeroLineWidth	 | Number	               | 1	                   | 第一条网格线的宽度(index 0).
zeroLineColor	 | Color	               | "rgba(0, 0, 0, 0.25)" | 第一条网格线的颜色(index 0).
offsetGridLines	 | Boolean	               | false	               | 如果为true, 标签被移动到网格线之间. 在柱状图中使用.

##### 轴线标题配置
网格线的配置是在轴线选项key为scaleLabel时启用。它定义了轴线标题。

Name         | Type	               | Default               |  Description
------------ |---------------------|-----------------------|-----------------------|
display	     | Boolean	           | false	               |
labelString	 | String	           | ""	                   | 标题文字. (i.e. "# of People", "Response Choices")
fontColor	 | Color	           | "#666"                | 轴线标题的文字颜色.
fontFamily	 | String	           | "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif" | 轴线标题的字体, 遵从css字体选项.
fontSize	 | Number	           | 12	                   | 轴线标题的文字大小.
fontStyle	 | String	           | "normal"	           | 轴线标题的文字样式, 遵从css文字样式选项 (i.e. normal, italic, oblique, initial, inherit).

##### 记号配置
网格线的配置是在轴线选项key为ticks时启用。它定义了轴坐标生成的记号。

Name            | Type     | Default |  Description
----------------|----------|---------|-----------------------|
autoSkip	    | Boolean  | true	 | 如果为true, 自动计算有多少标签能显示和隐藏。关掉这个配置可以显示所有的标签
autoSkipPadding | Number   | 0	     | 当autoSkip启用时记号与水平轴之间的间隔. 注意: 仅适用于水平轴线上.
callback	    | Function | function(value) { return helpers.isArray(value) ? value : '' + value;} | 返回的字符串代表记号的值，它会展示在图表上。请看下面的回调部分。
display	        | Boolean  | true	 | 如果为true, 显示记号.
fontColor	    | Color	   | "#666"	 | 记号标签的文字颜色.
fontFamily	    | String   | "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"  | 记号标签的字体, 遵从css字体选项.
fontSize	    | Number   | 12	     | 记号标签的字体大小.
fontStyle	    | String   | "normal"| 记号标签的文字样式, 遵从css样式选项 (i.e. normal, italic, oblique, initial, inherit).
labelOffset	    | Number   | 0	     | 以记号中心为起点对标签进行偏移设置 (y轴方向以x轴为标准, x轴方向以y轴为标准). Note: 这可能会导致标签的边缘被canvas的表元裁切
maxRotation	    | Number   | 90	     | 记号标签在旋转压缩标签时最大的旋转角度. Note: 旋转只在必要的时候出现. 注意: 仅适用于水平轴线上.
minRotation	    | Number   | 0	     | 记号标签最小的旋转角度. 注意: 仅适用于水平轴线上.
mirror	        | Boolean  | false	 | 翻转轴周围的记号标签, 将标签展示在图表内而不是图表外. 注意: 仅适用于垂直轴线上.
padding	        | Number   | 10	     | 记号标签和轴线之间的间隔距离. 注意: 仅适用于水平轴线上.
reverse	        | Boolean  | false	 | 记号标签的相反顺序.

##### 创建定制的记号格式
callback方法被用来进行高级记号定制。在下面的例子中，y轴上的每一个标签都将以科学记数的形式展现。

如果callback返回null或是undefined，网格线将会隐藏。

```javascript
var chartInstance = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    // Create scientific notation labels
                    callback: function(value, index, values) {
                        return value.toExponential();
                    }
                }
            }]
        }
    }
});
```

<span id="category"></span>
#### 类别轴线
类别轴线和1.0版本中的使用相似. 标签会根据图表的标签数组数据中绘制. 如果只有data.labels被定义, 这会被展示出来. 如果data.xLabels被定义并且轴式水平的，这是有效的，会被展示出来. 同样, 如果data.yLabels被定义并且轴是垂直的,这也没有问题. xLabels 和 yLabels 一起使用会创造一个x轴和y轴上都有字符串的图表.

##### 配置选项
类别轴线还有如下额外的配置选项可以设置

Name            | Type     | Default |  Description
----------------|----------|---------|-----------------------|
ticks.min       | String   | -       | 显示的最小项. 必须是标签数组的一个值
ticks.max       | String   | -       | 显示的最大项. 必须是标签数组的一个值


<span id="linear"></span>
#### 线型轴线
线型轴线使用的是图表数字型数据，可以在x轴，y轴使用

##### 配置选项
下面的选项都是由线型轴线提供，这些都是**ticks**的子选项

Name            | Type     | Default |  Description
----------------|----------|---------|-----------------------|
beginAtZero     | Boolean  | -	     | 如果为true, 轴线会从0开始.
min	            | Number   | -	     | 用户设置最小的轴线值，这个值会覆盖data数据中的最小值.
max	            | Number   | -	     | 用户设置最大的轴线值，这个值会覆盖data数据中的最大值.
maxTicksLimit	| Number   | 11	     | 记号和网格线的最大展示数量，如果没有设置，会默认限定11个记号数，但会展示所有的网格线.
fixedStepSize	| Number   | -	     | 用户设置固定的刻度，如果设置了，轴线记号会因为记号数的增加和刻度的增加而变得可计算。 如果没有设置,记号会用合适的数字算法自动标记.
stepSize	    | Number   | -	     | 如果定义了, 它可以与最小值和最大值一起使用，从而给出一个定制的步骤. 请看下面的实例.
suggestedMax	| Number   | -	     | 用户定义轴线的最大值, 在大于当前最大值的情况下覆盖最大值.
suggestedMin	| Number   | -	     | 用户定义轴线的最小值, 在小于当前最小值的情况下覆盖最小值.

##### 实例配置
下面的实例创建了一个在y轴上一0.5为间隔的从0到5的线型图表。

```javascript
var chartInstance = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    max: 5,
                    min: 0,
                    stepSize: 0.5
                }
            }]
        }
    }
});
```

<span id="logarithmic"></span>
#### 对数轴线
线型轴线使用的是图表数字型数据，可以在x轴，y轴使用。 正如名称所示，使用对数插值来确定一个值在轴上的位置。

##### 配置选项
下面的选项都是由对数轴线提供，这些都是**ticks**的子选项

Name            | Type     | Default |  Description
----------------|----------|---------|-----------------------|
min             | Number   | -       | 用户设置最小的轴线值，这个值会覆盖data数据中的最小值.
max	            | Number   | -       | 用户设置最大的轴线值，这个值会覆盖data数据中的最大值.

##### 实例配置
下面的例子创建了一个具有从1到1000的对数X轴的图表。

```javascript
var chartInstance = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        scales: {
            xAxes: [{
                type: 'logarithmic',
                position: 'bottom',
                ticks: {
                    min: 1,
                    max: 1000
                }
            }]
        }
    }
})
```

<span id="time"></span>
#### 时间轴线
时间轴线被用来展示时间和数据. 可以只用于x轴. 当创建记号时, 它会自动计算出轴线最合适的单元大小。

##### 配置选项
时间轴线提供下列配置选项. 它们都位于time子选项中.

Name            | Type                | Default        | Description
----------------|---------------------|----------------|-----------------------|
displayFormats  | Object              | -	           | 请看[Display Formats](http://www.chartjs.org/docs/#scales-display-formats)部分
isoWeekday	    | Boolean             | false	       | 如果值为true并且单元设置为‘week’，iso工作日将会被使用
max	            | [Time](http://www.chartjs.org/docs/#scales-date-formats)	              | -	           | 如果定义了, 会覆盖数据最大值
min	            | [Time](http://www.chartjs.org/docs/#scales-date-formats)	              | -	           | 如果定义了, 会覆盖数据最小值
parser	        | String or Function  | -	           | 如果定义为字符串, 它被解释为一种自定义格式，用于解析日期。如果这是一个函数,它必须返回一个moment.js对象 给出适当的数据值
round	        | String	          | -	           | 如果定义了, 日期将会四舍五入到单元的开始。请看[Time Units](http://www.chartjs.org/docs/#scales-time-units)查看可以使用的单元
tooltipFormat	| String	          | ''	           | moment js字符串格式用于工具提示
unit	        | String	          | -	           | 如果定义了, 会强制使用特定类型。请看下面的[Time Units](http://www.chartjs.org/docs/#scales-time-units)查看可以使用的单元
unitStepSize	| Number	          | 1	           | 网格线之间的单元数
minUnit	        | String	          | 'millisecond'  | 时间单元上最小展示格式

##### 数据格式
当为时间轴线提供数据时, Chart.js支持Moment.js支持的所有时间格式。 详情请看[Moment.js](http://momentjs.com/docs/#/parsing/) 文档。

##### 展示格式
下面的时间格式被用来配置不同的时间单元在轴作为记号标记时的字符串展示形式。 请看[moment.js](http://momentjs.com/docs/#/displaying/format/) 查看被允许使用的字符串格式。

Name            | Default 
----------------|------------------|
millisecond	    | 'SSS [ms]'
second	        | 'h:mm:ss a'
minute	        | 'h:mm:ss a'
hour	        | 'MMM D, hA'
day	            | 'll'
week	        | 'll'
month	        | 'MMM YYYY'
quarter	        | '[Q]Q - YYYY'
year	        | 'YYYY'

例如, 为“季度”单元设置显示格式，以显示月和年, 下面的配置将被传递给图表构造函数.

##### 时间单元
支持下裂时间度量. 这些名字可以作为字符串传递给 **time.unit** 选项来强制使用一个单元.

* millisecond(毫秒)
* second（秒）
* minute（分钟）
* hour（小时）
* day（天）
* week（周）
* month（月）
* quarter（三个月，季度）
* year（年）

例如,为了创建一个时间轴线的图表，一般都展示每个月的数据，如下配置可供使用.

```javascript
var chartInstance = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        scales: {
            xAxes: [{
                time: {
                    unit: 'month'
                }
            }]
        }
    }
})
```

<span id="radial"></span>
#### 放射形线形轴线
放射形线形轴线 是专门用于雷达和极坐标图类型的。 它覆盖了图表区域，而不是放在一个边缘上。

##### 配置选项
下列额外配置选项供放射线型轴线使用。

Name            | Type                | Default  | Description
----------------|---------------------|----------|-----------------------|
lineArc         | Boolean	          | false	 | 如果为 true, 结合圆弧使用，不然为直线使用。前者被极地地区的图表所使用，后者则被雷达图所使用
angleLines	    | Object	          | -	     | 详细请看下面的角度线选项部分.
pointLabels	    | Object	          | -	     | 详细请看下面的点标签选项部分.
ticks	        | Object	          | -	     | 请看下面的记号选项.

##### 角度线选项
下面的选项用来配置从图表中间到点标签的角度线。它们都位于angleLines子选项中。 注意这些选项只有在lineArc为false时使用。

Name            | Type      | Default              | Description
----------------|-----------|----------------------|-----------------------|
display	        | Boolean	| true	               | 如果为true，展示角度线.
color	        | Color	    | 'rgba(0, 0, 0, 0.1)' | 角度线颜色
lineWidth	    | Number    | 1                    | 角度线宽度


##### 点标签选项
下面的选项用来配置规模范围内的点标签。 它们都位于pointLabels子选项中.注意这些选项只有在lineArc为false时使用。

Name            | Type      | Default              | Description
----------------|-----------|----------------------|-----------------------|
callback	    | Function	| -	                   | 数据标签向轴标签转换后调用
fontColor	    | Color	    | '#666'	           | 文字颜色
fontFamily	    | String	| "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"	| 文字字体
fontSize	    | Number	| 10	               | 文字大小（像素级）
fontStyle	    | String	| 'normal'	           | 文字样式    

##### 记号选项

Name               | Type      | Default                      | Description
-------------------|-----------|------------------------------|-----------------------|
backdropColor	   | Color	   | 'rgba(255, 255, 255, 0.75)'  | 标签背景幕布颜色
backdropPaddingX   | Number	   | 2	                          | 标签背景幕布水平padding 
backdropPaddingY   | Number	   | 2	                          | 标签背景幕布垂直padding
beginAtZero	       | Boolean   | -	                          | 如果为true, 轴线会从0开始.
min	               | Number	   | -	                          | 用户设置最小的轴线值，这个值会覆盖data数据中的最小值.
max	               | Number	   | -	                          | 用户设置最大的轴线值，这个值会覆盖data数据中的最大值.
maxTicksLimit	   | Number	   | 11	                          | 记号和网格线的最大展示数量，如果没有设置，会默认限定11个记号数，但会展示所有的网格线.
showLabelBackdrop  | Boolean   | true	                      | 如果为true, 在记号标签后绘制一个背景
fixedStepSize	   | Number	   | -	                          | 用户设置固定的刻度，如果设置了，轴线记号会因为记号数的增加和刻度的增加而变得可计算。 如果没有设置,记号会用合适的数字算法自动标记..
stepSize	       | Number	   | -	                          | 如果定义了, 它可以与最小值和最大值一起使用，从而给出一个定制的步骤. 请看下面的实例.
suggestedMax	   | Number	   | -	                          | 用户定义轴线的最大值, 在大于当前最大值的情况下覆盖最大值.
suggestedMin	   | Number	   | -	                          | 用户定义轴线的最小值, 在小于当前最小值的情况下覆盖最小值.

<span id="update"></span>
#### 更新默认的轴线配置
使用轴线提供的接口可以轻易的修改配置。 传递的部分配置修改会和当前轴线的默认配置合并。

例如, 为了给所有的线型轴线设定最小值0，你可以做如下操作。如何在这操作之后创建的线型轴线都会有一个最小值0。

```javascript
Chart.scaleService.updateScaleDefaults('linear', {
    ticks: {
        min: 0
    }
})
```
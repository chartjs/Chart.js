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






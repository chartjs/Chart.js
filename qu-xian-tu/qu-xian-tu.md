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
```javascsript
var myLineChart = Chart.Line(ctx, {
    data: data,
    options: options
});
```






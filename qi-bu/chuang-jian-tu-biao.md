####使用
用旧有的script元素引入Chart.js：

```
<script src="Chart.js"></script>
<script>
    var myChart = new Chart({...})
</script>

```

使用模块加载引入Chart.js：

```
// Using CommonJS
var Chart = require('chart.js')
var myChart = new Chart({...})

// ES6
import Chart from 'chart.js'
let myChart = new Chart({...})

// Using requirejs
require(['path/to/Chartjs'], function(Chart){
 var myChart = new Chart({...})
})
```

####创建图标
为了创建一个图表，我们需要在实际使用场景中实例化**Chart**类.举个栗子：

```
<canvas id="myChart" width="400" height="400"></canvas>
```
```
// Any of the following formats may be used
var ctx = document.getElementById("myChart");
var ctx = document.getElementById("myChart").getContext("2d");
var ctx = $("#myChart");
var ctx = "myChart";
```

当创建好了这些元素和环境时，你已经做好了创建图标的准备！

下面的代码实例化了一个y轴以0为起点，不同票数之间颜色各异的柱状图。

```
<canvas id="myChart" width="400" height="400"></canvas>
<script>
var ctx = document.getElementById("myChart");
var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
        datasets: [{
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3],
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
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true
                }
            }]
        }
    }
});
</script>
```

使用Chart.js就是这么简单！自此开始你可以去尝试使用多种多样的配置参数去定制化你的图表了。

Chart.js每一个版本的**Chart.js.zip**文件中都有一个**/samples**目录，里面有很多实例可供借鉴。



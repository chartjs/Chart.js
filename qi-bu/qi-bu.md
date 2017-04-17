<span id="xiazai"></span>
#### 下载chart.js
你可以在github上下载最新版本的[Chart.js](https://github.com/chartjs/Chart.js/releases)，或是使用Chart.js的[CDN](https://cdnjs.com/libraries/Chart.js)地址来代替。当你下载或是克隆了这个库之后，必须使用**gulp build**命令来生成dist目录。Chart.js库不会存在预先编译好的版本了，所以强烈建议使用可替代的方式来下载这个库进行使用。

<span id="anzhuang"></span>
#### 安装
##### npm

```shell
npm install chart.js --save
```
##### bower

```shell
bower install chart.js --save
```

<span id="xuanzebanben"></span>
#### 选择合适的版本
Chart.js提供了两种不同的版本供你选择。

**Chart.js**和**Chart.min.js**包含了Chart.js和它的一些附属子类库。如果你使用这个版本的时候需要使用时间轴，[Moment.js](http://momentjs.com/)就需要在Chart.js之前引入。

**Chart.bundle.js**和**chart.bundle.min.js**在一个单独的文件中包含了Moment.js。如果你需要使用时间轴，又只想引入单个文件，请选择这个版本。在你的应用里已经包含了Moment.js时候不要使用这个版本。因为这样会引入两次Moment.js,增加了页面加载时间，也会诱发一些潜在的版本问题。

<span id="shiyong"></span>
#### 使用
用旧有的script元素引入Chart.js：

```html
<script src="Chart.js"></script>
<script>
    var myChart = new Chart({...})
</script>

```

使用模块加载引入Chart.js：

```javascript
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

<span id="creating"></span>
#### 创建图表
为了创建一个图表，我们需要在实际使用场景中实例化**Chart**类.举个栗子：

```html
<canvas id="myChart" width="400" height="400"></canvas>
```
```javascript
// Any of the following formats may be used
var ctx = document.getElementById("myChart");
var ctx = document.getElementById("myChart").getContext("2d");
var ctx = $("#myChart");
var ctx = "myChart";
```

当创建好了这些元素和环境时，你已经做好了创建图标的准备！

下面的代码实例化了一个y轴以0为起点，不同票数之间颜色各异的柱状图。

```html
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

Chart.js每一个[版本](https://github.com/chartjs/Chart.js/releases)的**Chart.js.zip**文件中都有一个**/samples**目录，里面有很多实例可供借鉴。



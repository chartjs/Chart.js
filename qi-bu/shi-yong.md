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
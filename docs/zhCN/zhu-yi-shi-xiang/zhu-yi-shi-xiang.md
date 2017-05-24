### 注意事项
<span id="previous"></span>
#### 之前的版本
第二版的chart.js在api方面和第一版完全不一样。

多数之前版本的一些选项在新版中都有与之对应或相同的选项。

使用最新版的Chart.js的时候请参考使用[chartjs.org](http://www.chartjs.org/docs/)中的官方文档。

之前版本的官方文档也可以在github中找到。
	
* [1.x Documentation](https://github.com/chartjs/Chart.js/tree/v1.1.1/docs)  

<span id="browser"></span>
#### 浏览器支持
Chart.js适用于所有支持canvas的浏览器。

目前主流的移动浏览器已经对canvas提供了全面的支持。（[http://caniuse.com/#feat=canvas](http://caniuse.com/#feat=canvas)）

感谢[BrowserStack](https://browserstack.com)允许我们的团队在许多的浏览器中进行测试。

<span id="bugs"></span>
#### bugs与issues
如有问题，请在[GitHub](https://github.com/chartjs/Chart.js)上进行反馈。请尽力提供问题示例或代码片段（[jsbin](jsbin.com)）以及详细的问题描述。

<span id="contribution"></span>
#### 贡献
我们欢迎大家对代码库做贡献，但请遵循如下规则：
 
* 利用tab键进行缩进，不要使用空格。
* 在**/src**文件中只修改单个文件。
* 检查你的代码确保执行**gulp lint**,保证代码能通过**eslint**代码标准。
* 检查你的代码确保执行**gulp test**,保证代码能通过测试。
* 保持请求的简洁，确保在相关文档中对新加入的功能进行描述
* 思考你的修改是否对库的所有使用者都有帮助，这样的修改是否更应该抽象成一个插件。

<span id="license"></span>
#### 协议
Chart.js是开源的，遵循[MIT协议](http://opensource.org/licenses/MIT)。

<span id="charting"></span>
#### 图表库对比
| Feature       | Chart.js        | D3            | HighCharts     | Chartist     |
|:------------- |:---------------:| -------------:|----------------|--------------|
|免费            |      ✓          |         ✓     |                |     ✓        |
|Canvas         |      ✓          |               |                |              |
|SVG            |                 |         ✓     |        ✓       |     ✓        |
|内置图表        |      ✓          |               |        ✓       |     ✓        |
|8种以上图标类型  |      ✓          |         ✓     |        ✓       |              |
|图表可扩展      |      ✓          |         ✓     |                |              |
|支持现代浏览器   |      ✓          |         ✓     |        ✓       |     ✓        |
|文档资源充足     |      ✓          |         ✓     |        ✓       |     ✓        |
|Open Source    |      ✓          |         ✓     |        ✓       |     ✓        |

图表类别

| Type          | Chart.js        | HighCharts    | Chartist       |
|:------------- |:---------------:| -------------:|----------------|
|混合类型        |       ✓          |      ✓       |                |
|线型            |      ✓          |         ✓     |        ✓       |
|柱状图          |      ✓          |         ✓     |        ✓       |
|水平柱状图       |      ✓          |         ✓     |        ✓       |
|饼图／环状图     |      ✓          |         ✓     |        ✓       |
|极地图          |      ✓          |         ✓     |                |
|雷达图          |      ✓          |               |                |
|散射图          |      ✓          |         ✓     |        ✓       |
|泡泡图          |      ✓          |               |                |
|间距图         |                  |         ✓     |                |
|地图(温度图/柱状图等等)|            |         ✓     |                |

<span id="plugin"></span>
#### 热门插件
Chart.js还有很多插件为其提供额外的功能。下面列举了一些比较热门的插件。除此之外，你还可以在[Chart.js GitHub organization](https://github.com/chartjs)上找到更多的插件。
 
 * [chartjs-plugin-annotation.js](https://github.com/chartjs/chartjs-plugin-annotation)－在图表区域画线图和方形图 
 * [chartjs-plugin-deferred.js](https://github.com/chartjs/chartjs-plugin-deferred)－滚轮滑动到图表区域再进行图表加载（延迟加载）
 * [chartjs-plugin-draggable.js](https://github.com/compwright/chartjs-plugin-draggable)－使得被鼠标选中的图表可以被拖动
 * [chartjs-plugin-zoom.js](https://github.com/chartjs/chartjs-plugin-zoom)－支持图表的缩放和平移
 * [Chart.BarFunnel.js](https://github.com/chartjs/Chart.BarFunnel.js)－增加了一个漏斗型的图标类
 * [Chart.LinearGauge.js](https://github.com/chartjs/Chart.LinearGauge.js)－增加了一个线性计量的图表类型
 * [Chart.Smith.js](https://github.com/chartjs/Chart.smith.js)－增加了一个smith图表类型

<span id="extension"></span>
#### 热门扩展
在一些常用的框架中也可以使用Chart.js扩展。这里列举一些热门的框架和扩展。
	
**Angular**

* [angular-chart.js](https://github.com/jtblin/angular-chart.js) 
* [tc-angular-chartjs](https://github.com/carlcraig/tc-angular-chartjs) 
* [angular-chartjs](https://github.com/petermelias/angular-chartjs) 
* [Angular Chart-js Directive](https://github.com/earlonrails/angular-chartjs-directive) 

**React**

* [react-chartjs2](https://github.com/houjiazong/react-chartjs2) 
* [react-chartjs-2](https://github.com/gor181/react-chartjs-2) 

**Django**

* [Django JChart](https://github.com/matthisk/django-jchart) 
* [Django Chartjs](https://github.com/novafloss/django-chartjs) 

**Ruby on Rails**

* [chartjs-ror](https://github.com/airblade/chartjs-ror) 

**Laravel**

* [laravel-chartjs](https://github.com/fxcosta/laravel-chartjs)  

**Vue.js**

* [vue-chartjs](https://github.com/apertureless/vue-chartjs/) 

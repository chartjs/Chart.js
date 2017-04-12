###开始
####下载chart.js
你可以在github上下载最新版本的Chart.js，或是使用Chart.js的CDN地址来代替。当你下载或是克隆了这个库之后，必须使用gulp build命令来生成dist目录。Chart.js库不会存在预先编译好的版本了，所以强烈建议使用可替代的方式来下载这个库进行使用。
####安装
#####npm

```
npm install chart.js --save
```
#####bower

```
bower install chart.js --save
```
####选择合适的版本
Chart.js提供了两种不同的版本供你选择。

**Chart.js**和**Chart.min.js**包含了Chart.js和它的一些附属子类库。如果你使用这个版本的时候需要使用时间轴，Moment.js就需要在Chart.js之前引入。

**Chart.bundle.js**和**chart.bundle.min.js**在一个单独的文件中包含了Moment.js。如果你需要使用时间轴，又只想引入单个文件，请选择这个版本。在你的应用里已经包含了Moment.js时候不要使用这个版本。因为这样会引入两次Moment.js,增加了页面加载时间，也会诱发一些潜在的版本问题。
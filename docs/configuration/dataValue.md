# datalabels

Prints the value of the point on the graph

## Usage
To enable printing of the data values, add `drawLabel = true` to the dataset. 

## Configuration
The datavalue configuration is passed into the `options.valueLabel` namespace. The global options for this is defined in `Chart.defaults.global.valueLabel`.


| Name | Type | Default | Description
| -----| ---- | --------| -----------
| `formatter` |  |  | Formatter for the label. [more...](#formatter)
| `padding` | ` 0` | `0` | Number of pixels to add above and below the title text. [more ..](#padding)
| `value` | `function( chart, value)` | `''` | To customize the value to be printed 

### padding
` { top:0, left:0}`

### formatter
| Name | Type | Default | Description
| -----| ---- | --------| -----------
| `fontWeight` | `String` | `normal` | fontWeight of the text
| `fontColor` | `String` | `'#000'` | Color of the text
| `fontSize` | `Number` | `10` | Font size
| `fontStyle` | `String` | `'bold'` | Font style

## Example Usage

```javascript
var chart = new Chart(ctx, {
    type: 'line',
    data: {
    datasets:[{drawLabel:true, data:[1,2,3,4]}]
    },
    options: {
        plugins:{
            datalabels: {
                value:function(chart,value){
                    return  value + '$'; 
                },
                formatter:{
                    fontColor:'#0F0'
                }
            }
        }
    }
})
```
